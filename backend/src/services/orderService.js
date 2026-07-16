const prisma = require('../config/prisma');
const { validateAddress, performFinalCheck } = require('./orderValidationService');

const createOrderService = async (userId, bodyData) => {
  const {
    shippingAddress,
    customerPhone,
    customerEmail,
    note,
    paymentMethod,
    shippingFee,
    discountAmount,
    items: directItems,
    province_id,
    district_id,
    ward_id,
    street_address,
    receiver_phone
  } = bodyData;

  let orderItems;

  if (directItems && directItems.length > 0) {
    // Direct order with specific items
    orderItems = await Promise.all(
      directItems.map(async ({ productId, quantity }) => {
        const product = await prisma.product.findFirst({ where: { id: productId, isDeleted: false } });
        if (!product) throw new Error(`Product ${productId} not found`);
        return { product, quantity };
      })
    );
  } else {
    // Order from cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || !cart.items || cart.items.length === 0) throw new Error('Giỏ hàng trống');

    const invalidItems = cart.items.filter((i) => i.product.isDeleted);
    if (invalidItems.length > 0) {
      throw new Error('Một số sản phẩm không còn bán');
    }

    orderItems = cart.items.map(({ product, quantity }) => ({ product, quantity }));
  }

  const subtotal = orderItems.reduce((sum, { product, quantity }) => {
    return sum + (product.salePrice || product.price) * quantity;
  }, 0);
  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

  // Generate unique order code
  const orderCode = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // Step 2.1: Address Validation Check
  const addressValidation = validateAddress({ province_id, district_id, ward_id, street_address, receiver_phone });

  // Create order + items in transaction (without stock decrement, done in Step 2.3)
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        orderCode,
        subtotal,
        shippingFee,
        discountAmount,
        totalAmount,
        shippingAddress,
        customerPhone,
        customerEmail,
        note,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'UNPAID' : 'PENDING',
        orderStatus: addressValidation.isValid ? 'PENDING_VALIDATION' : 'INVALID_ADDRESS',
        province_id,
        district_id,
        ward_id,
        street_address,
        receiver_phone,
        orderItems: {
          create: orderItems.map(({ product, quantity }) => ({
            productId: product.id,
            quantity,
            price: product.salePrice || product.price,
            productName: product.name,
            productImage: product.thumbnail,
          })),
        },
      },
      include: {
        orderItems: { include: { product: { select: { id: true, name: true, thumbnail: true } } } },
      },
    });

    // Update user profile info (autofill for future checkouts) if address is valid
    if (addressValidation.isValid) {
      await tx.user.update({
        where: { id: userId },
        data: {
          address: shippingAddress,
          phone: customerPhone,
          province_id,
          district_id,
          ward_id,
          street_address,
          receiver_phone,
        }
      });
    }

    // Clear cart if ordered from cart
    if (!directItems) {
      const userCart = await tx.cart.findUnique({ where: { userId } });
      if (userCart) {
        await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }
    }

    return newOrder;
  });

  // If address validation failed, throw error containing the saved order so controller can reply.
  if (!addressValidation.isValid) {
    const err = new Error(addressValidation.message);
    err.statusCode = 400;
    err.order = order;
    throw err;
  }

  // Step 2.2 & 2.3 for COD orders: Process stock check and confirmed status synchronously.
  if (paymentMethod === 'COD') {
    return await performFinalCheck(order.id);
  }

  return order;
};

// tx: optional Prisma transaction client. Pass it when this is called as part of
// a larger transaction (e.g. together with the order status update) so both
// writes succeed or fail together. Falls back to its own transaction when
// called standalone.
const cancelOrderService = async (orderId, tx) => {
  const client = tx || prisma;
  const orderItems = await client.orderItem.findMany({ where: { orderId } });
  const restoreStock = orderItems.map((item) =>
    client.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    })
  );

  if (tx) {
    await Promise.all(restoreStock);
  } else {
    await prisma.$transaction(restoreStock);
  }
};

module.exports = {
  createOrderService,
  cancelOrderService
};
