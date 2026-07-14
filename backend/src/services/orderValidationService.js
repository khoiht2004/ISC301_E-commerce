const prisma = require('../config/prisma');

/**
 * Step 2.1: Validate Address Information
 * Checks if province_id, district_id, ward_id, street_address, and receiver_phone are provided
 * and if receiver_phone matches the Vietnamese phone number format.
 */
const validateAddress = (addressData) => {
  const { province_id, district_id, ward_id, street_address, receiver_phone } = addressData || {};

  if (!province_id || !district_id || !ward_id || !street_address || !receiver_phone) {
    return {
      isValid: false,
      message: 'Tất cả các trường địa chỉ giao hàng (province_id, district_id, ward_id, street_address, receiver_phone) không được để trống.',
    };
  }

  // Clean phone number: keep only digits
  const cleanedPhone = receiver_phone.replace(/\D/g, '');
  // Regex for Vietnam phone number (supports optional 0 or 84 prefix followed by 3, 5, 7, 8, 9 and 8 digits)
  const vnPhoneRegex = /^(0|84)?(3|5|7|8|9)[0-9]{8}$/;

  if (!vnPhoneRegex.test(cleanedPhone)) {
    return {
      isValid: false,
      message: 'Số điện thoại nhận hàng không đúng định dạng số điện thoại Việt Nam (phải bắt đầu bằng các đầu số 03, 05, 07, 08, 09 hoặc mã quốc gia 84).',
    };
  }

  return { isValid: true };
};

/**
 * Step 2.3: Final Check (Inventory Check & Holding stock)
 * Runs within a transaction to check stock for all items, decrement it if sufficient,
 * and transition order status to CONFIRMED or OUT_OF_STOCK.
 */
const performFinalCheck = async (orderId) => {
  console.log(`[Order Validation] Starting Step 2.3 Final Check for Order ID: ${orderId}`);

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch order details with items
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // If already processed in Step 2.3, skip to avoid double decrement
    if (order.orderStatus === 'CONFIRMED' || order.orderStatus === 'OUT_OF_STOCK') {
      console.log(`[Order Validation] Order ${order.orderCode} already processed in Step 2.3. Current status: ${order.orderStatus}`);
      return order;
    }

    // 2. Check stock for each item
    let hasEnoughStock = true;
    const insufficientItems = [];

    for (const item of order.orderItems) {
      const product = await tx.product.findFirst({
        where: { id: item.productId, isDeleted: false }
      });

      if (!product || product.stock < item.quantity) {
        hasEnoughStock = false;
        insufficientItems.push({
          productId: item.productId,
          productName: product ? product.name : 'Unknown Product',
          requested: item.quantity,
          available: product ? product.stock : 0
        });
      }
    }

    // 3. Update status and adjust stock accordingly
    if (hasEnoughStock) {
      // Sufficient stock -> Decrement stock (Hold kho)
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
        console.log(`[Order Validation] Subtracted ${item.quantity} from product ${item.productName} (ID: ${item.productId})`);
      }

      // Update order status to CONFIRMED
      const confirmedOrder = await tx.order.update({
        where: { id: orderId },
        data: { orderStatus: 'CONFIRMED' },
        include: { orderItems: true }
      });

      // Simulate pushing to shipping partner
      console.log(`[Order Validation] ✅ Order ${order.orderCode} CONFIRMED. Pushed shipping details to carrier.`);
      console.log(`[Shipping Service] Pushed: { orderCode: "${order.orderCode}", address: "${order.shippingAddress}", phone: "${order.receiver_phone || order.customerPhone}" }`);
      
      return confirmedOrder;
    } else {
      // Insufficient stock -> Update order status to OUT_OF_STOCK
      const outOfStockOrder = await tx.order.update({
        where: { id: orderId },
        data: { orderStatus: 'OUT_OF_STOCK' },
        include: { orderItems: true }
      });

      // Log notification for CSKH / Operations
      console.warn(`[Order Validation] ❌ Order ${order.orderCode} OUT_OF_STOCK! Items short:`, JSON.stringify(insufficientItems));
      console.warn(`[Notification System] Alerting Operations team for manual follow-up on Order ${order.orderCode}.`);

      return outOfStockOrder;
    }
  });
};

module.exports = {
  validateAddress,
  performFinalCheck,
};
