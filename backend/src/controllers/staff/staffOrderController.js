const prisma = require('../../config/prisma');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response');
const { cancelOrderService } = require('../../services/orderService');

const VALID_ORDER_STATUSES = [
  'PENDING', 
  'PENDING_VALIDATION', 
  'INVALID_ADDRESS', 
  'PAYMENT_FAILED', 
  'OUT_OF_STOCK', 
  'CONFIRMED', 
  'PROCESSING', 
  'SHIPPING', 
  'DELIVERED', 
  'COMPLETED', 
  'CANCELLED',
  'RETURNED',
  'RETURN_REQUESTED'
];
const VALID_PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED'];

// GET /api/staff/orders
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, orderStatus, paymentStatus, userId, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let where = {};
    if (orderStatus && VALID_ORDER_STATUSES.includes(orderStatus)) where.orderStatus = orderStatus;
    if (paymentStatus && VALID_PAYMENT_STATUSES.includes(paymentStatus)) where.paymentStatus = paymentStatus;
    if (userId) where.userId = parseInt(userId);
    if (search && search.trim()) {
      const searchTerm = search.trim();
      where.OR = [
        { orderCode: { contains: searchTerm } },
        { user: { fullName: { contains: searchTerm } } },
        { user: { phone: { contains: searchTerm } } },
      ];
    }

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
      return errorResponse(res, `Trạng thái đơn hàng không hợp lệ. Phải là một trong: ${VALID_ORDER_STATUSES.join(', ')}`, 400);
    }

    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!order) return errorResponse(res, 'Không tìm thấy đơn hàng', 404);

    // Prevent updating already cancelled or returned orders
    if (['CANCELLED', 'RETURNED'].includes(order.orderStatus)) {
      return errorResponse(res, `Không thể cập nhật đơn hàng đang ở trạng thái ${order.orderStatus}`, 400);
    }

    // Khôi phục tồn kho (nếu cần) và cập nhật trạng thái đơn hàng phải thành công/thất bại cùng nhau
    const shouldRestoreStock =
      ['CANCELLED', 'RETURNED'].includes(status) &&
      ['CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'RETURN_REQUESTED'].includes(order.orderStatus);

    const updated = await prisma.$transaction(async (tx) => {
      if (shouldRestoreStock) {
        await cancelOrderService(order.id, tx);
      }

      const updateData = { orderStatus: status };

      // Automatically assign staff if order doesn't have one and status changes to active processing
      if (['CONFIRMED', 'PROCESSING'].includes(status) && !order.assignedStaffId) {
        updateData.assignedStaffId = req.user.id;
      }

      return tx.order.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          orderItems: { include: { product: true } },
        },
      });
    });

    return successResponse(res, updated, 'Cập nhật trạng thái đơn hàng thành công');
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
      return errorResponse(res, `Trạng thái thanh toán không hợp lệ. Phải là một trong: ${VALID_PAYMENT_STATUSES.join(', ')}`, 400);
    }

    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!order) return errorResponse(res, 'Không tìm thấy đơn hàng', 404);

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

    return successResponse(res, updated, 'Cập nhật trạng thái thanh toán thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllOrders, updateOrderStatus, updatePaymentStatus };
