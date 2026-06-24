const prisma = require('../../config/prisma');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response');
const { cancelOrderService } = require('../../services/orderService');

const VALID_ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
const VALID_PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED'];

// GET /api/staff/orders
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, orderStatus, paymentStatus, userId } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let where = {};
    if (orderStatus && VALID_ORDER_STATUSES.includes(orderStatus)) where.orderStatus = orderStatus;
    if (paymentStatus && VALID_PAYMENT_STATUSES.includes(paymentStatus)) where.paymentStatus = paymentStatus;
    if (userId) where.userId = parseInt(userId);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true } },
          orderItems: {
            include: { product: { select: { id: true, name: true, thumbnail: true, createdById: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    return paginatedResponse(res, orders, total, pageNum, limitNum);
  } catch (err) {
    next(err);
  }
};

// PUT /api/staff/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    if (!VALID_ORDER_STATUSES.includes(status)) {
      return errorResponse(res, `Invalid order status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}`, 400);
    }

    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!order) return errorResponse(res, 'Order not found', 404);

    // Prevent updating completed/cancelled orders
    if (['DELIVERED', 'CANCELLED'].includes(order.orderStatus)) {
      return errorResponse(res, `Cannot update a ${order.orderStatus} order`, 400);
    }

    // If cancelling, restore stock
    if (status === 'CANCELLED') {
      await cancelOrderService(order.id);
    }

    const updated = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { orderStatus: status },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        orderItems: { include: { product: true } },
      },
    });

    return successResponse(res, updated, 'Order status updated');
  } catch (err) {
    next(err);
  }
};

// PUT /api/staff/orders/:id/payment-status
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    if (!VALID_PAYMENT_STATUSES.includes(status)) {
      return errorResponse(res, `Invalid payment status. Must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}`, 400);
    }

    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!order) return errorResponse(res, 'Order not found', 404);

    const updated = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { 
        paymentStatus: status,
        paidAt: status === 'PAID' ? new Date() : null,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    return successResponse(res, updated, 'Payment status updated');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllOrders, updateOrderStatus, updatePaymentStatus };
