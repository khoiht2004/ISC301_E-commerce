const prisma = require('../config/prisma');

const createOrderService = async (userId, bodyData) => {
  const { shippingAddress, customerPhone, customerEmail, note, paymentMethod, shippingFee, discountAmount, items: directItems } = bodyData;

  let orderItems;

  if (directItems && directItems.length > 0) {
    // Direct order with specific items
    orderItems = await Promise.all(
      directItems.map(async ({ productId, quantity }) => {
        const product = await prisma.product.findFirst({ where: { id: productId, isDeleted: false } });
        if (!product) throw new Error(`Product ${productId} not found`);
        if (product.stock < quantity) throw new Error(`Insufficient stock for ${product.name}`);
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

    const invalidItems = cart.items.filter((i) => i.product.isDeleted || i.product.stock < i.quantity);
    if (invalidItems.length > 0) {
      throw new Error('Một số sản phẩm đã hết hàng hoặc không còn bán');
    }

    orderItems = cart.items.map(({ product, quantity }) => ({ product, quantity }));
  }

  const subtotal = orderItems.reduce((sum, { product, quantity }) => {
    return sum + (product.salePrice || product.price) * quantity;
  }, 0);
  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

  // Generate unique order code
  const orderCode = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // Create order + items in transaction
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
        paymentStatus: 'PENDING',
        orderStatus: paymentMethod === 'COD' ? 'PROCESSING' : 'PENDING',
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

    // Update user profile info (autofill for future checkouts)
    await tx.user.update({
      where: { id: userId },
      data: {
        address: shippingAddress,
        phone: customerPhone,
      }
    });

    // Decrement stock
    for (const { product, quantity } of orderItems) {
      await tx.product.update({
        where: { id: product.id },
        data: { stock: { decrement: quantity } },
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

  return order;
};

const cancelOrderService = async (orderId) => {
  const orderItems = await prisma.orderItem.findMany({ where: { orderId } });
  await prisma.$transaction(
    orderItems.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
    )
  );
};

module.exports = {
  createOrderService,
  cancelOrderService
};
