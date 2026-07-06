const { z } = require('zod');
const prisma = require('../config/prisma');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { ROLES } = require('../constants/roles');
const { createOrderService } = require('../services/orderService');

const VALID_ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
const VALID_PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED'];

const createOrderSchema = z.object({
  shippingAddress: z.string().min(5, 'Shipping address is required'),
  customerPhone: z.string().min(9, 'Phone number is required'),
  customerEmail: z.string().email('Valid email is required'),
  note: z.string().optional(),
  paymentMethod: z.enum(['COD', 'BANK_TRANSFER', 'MOMO', 'VNPAY']).default('COD'),
  shippingFee: z.coerce.number().int().min(0).optional().default(0),
  discountAmount: z.coerce.number().int().min(0).optional().default(0),
  items: z.array(z.object({
    productId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive(),
  })).optional(), 
});

// POST /api/orders — place order from cart or explicit items
const createOrder = async (req, res, next) => {
  try {
    const bodyData = createOrderSchema.parse(req.body);
    const order = await createOrderService(req.user.id, bodyData);
    return successResponse(res, order, 'Order placed successfully', 201);
  } catch (err) {
    if (err.message?.includes('not found') || err.message?.includes('stock') || err.message?.includes('Giỏ hàng')) {
      return errorResponse(res, err.message, 400);
    }
    next(err);
  }
};

// GET /api/orders/my-orders — current user's orders
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, orderStatus, paymentStatus } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const where = { userId: req.user.id };
    if (orderStatus && VALID_ORDER_STATUSES.includes(orderStatus)) where.orderStatus = orderStatus;
    if (paymentStatus && VALID_PAYMENT_STATUSES.includes(paymentStatus)) where.paymentStatus = paymentStatus;

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

    if (!order) return errorResponse(res, 'Order not found', 404);
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

    if (!order) return errorResponse(res, 'Order not found', 404);
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

    if (!order) return errorResponse(res, 'Order not found', 404);
    return successResponse(res, order);
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getPaymentStatus, getOrderByCode };
