const { z } = require('zod');
const prisma = require('../config/prisma');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { ROLES } = require('../constants/roles');
const { createOrderService, cancelOrderService } = require('../services/orderService');

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

const createOrderSchema = z.object({
  shippingAddress: z.string().min(5, 'Địa chỉ giao hàng là bắt buộc'),
  customerPhone: z.string().min(9, 'Số điện thoại là bắt buộc'),
  customerEmail: z.string().email('Email không hợp lệ'),
  note: z.string().optional(),
  paymentMethod: z.enum(['COD', 'BANK_TRANSFER', 'MOMO', 'VNPAY']).default('COD'),
  shippingFee: z.coerce.number().int().min(0).optional().default(0),
  discountAmount: z.coerce.number().int().min(0).optional().default(0),
  items: z.array(z.object({
    productId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive(),
  })).optional(),
  province_id: z.string().optional().nullable(),
  district_id: z.string().optional().nullable(),
  ward_id: z.string().optional().nullable(),
  street_address: z.string().optional().nullable(),
  receiver_phone: z.string().optional().nullable(),
});

// POST /api/orders — place order from cart or explicit items
const createOrder = async (req, res, next) => {
  try {
    const bodyData = createOrderSchema.parse(req.body);
    const order = await createOrderService(req.user.id, bodyData);
    return successResponse(res, order, 'Đặt hàng thành công', 201);
  } catch (err) {
    if (err.order) {
      // Không kèm field `data` khi trả lỗi — thông tin đơn hàng (đã lưu nhưng lỗi
      // địa chỉ) được trả qua field `order` riêng để FE vẫn có thể tham chiếu.
      return res.status(err.statusCode || 400).json({
        success: false,
        message: err.message,
        order: err.order
      });
    }
    if (err.message?.includes('not found') || err.message?.includes('stock') || err.message?.includes('Giỏ hàng')) {
      return errorResponse(res, err.message, 400);
    }
    next(err);
  }
};

// GET /api/orders/my-orders — current user's orders
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, orderStatus, paymentStatus, tab, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const where = { userId: req.user.id };

    if (tab) {
      switch (tab) {
        case 'pending_pickup':
          where.orderStatus = { in: ['PENDING', 'PENDING_VALIDATION', 'CONFIRMED', 'PROCESSING', 'OUT_OF_STOCK'] };
          break;
        case 'shipping':
          where.orderStatus = 'SHIPPING';
          break;
        case 'delivered':
          where.orderStatus = { in: ['DELIVERED', 'COMPLETED'] };
          break;
        case 'returned':
          where.orderStatus = { in: ['RETURNED', 'RETURN_REQUESTED'] };
          break;
        case 'cancelled':
          where.orderStatus = { in: ['CANCELLED', 'PAYMENT_FAILED', 'INVALID_ADDRESS'] };
          break;
        default:
          break;
      }
    } else if (orderStatus && VALID_ORDER_STATUSES.includes(orderStatus)) {
      where.orderStatus = orderStatus;
    }

    if (paymentStatus && VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      where.paymentStatus = paymentStatus;
    }

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { orderCode: { contains: searchTerm } },
        {
          orderItems: {
            some: {
              productName: { contains: searchTerm }
            }
          }
        }
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: { product: { select: { id: true, name: true, thumbnail: true } } },
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

// GET /api/orders/:id — get single order
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const where = { id: parseInt(id), userId: req.user.id };

    const order = await prisma.order.findFirst({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        orderItems: {
          include: { product: { select: { id: true, name: true, thumbnail: true, price: true } } },
        },
      },
    });

    if (!order) return errorResponse(res, 'Không tìm thấy đơn hàng', 404);
    return successResponse(res, order);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:orderCode/payment-status
const getPaymentStatus = async (req, res, next) => {
  try {
    const { orderCode } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { orderCode },
      select: { paymentStatus: true, orderStatus: true }
    });

    if (!order) return errorResponse(res, 'Không tìm thấy đơn hàng', 404);
    return res.json({
      orderCode,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/code/:orderCode — lookup by orderCode string
const getOrderByCode = async (req, res, next) => {
  try {
    const { orderCode } = req.params;
    const where = { orderCode, userId: req.user.id };

    const order = await prisma.order.findFirst({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        orderItems: {
          include: { product: { select: { id: true, name: true, thumbnail: true, price: true } } },
        },
      },
    });

    if (!order) return errorResponse(res, 'Không tìm thấy đơn hàng', 404);
    return successResponse(res, order);
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/cancel — cancel order by customer
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id }
    });

    if (!order) {
      return errorResponse(res, 'Không tìm thấy đơn hàng', 404);
    }

    const CANCELLABLE_STATUSES = ['PENDING', 'PENDING_VALIDATION', 'CONFIRMED', 'PROCESSING', 'OUT_OF_STOCK'];
    if (!CANCELLABLE_STATUSES.includes(order.orderStatus)) {
      return errorResponse(res, `Không thể hủy đơn hàng ở trạng thái ${order.orderStatus}`, 400);
    }

    // Restore stock (nếu có) + cập nhật trạng thái đơn hàng phải thành công/thất bại cùng nhau
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Restore stock if the order had decremented stock (status is CONFIRMED or PROCESSING)
      if (['CONFIRMED', 'PROCESSING'].includes(order.orderStatus)) {
        await cancelOrderService(orderId, tx);
      }

      return tx.order.update({
        where: { id: orderId },
        data: { orderStatus: 'CANCELLED' }
      });
    });

    return successResponse(res, updatedOrder, 'Hủy đơn hàng thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getPaymentStatus, getOrderByCode, cancelOrder };
