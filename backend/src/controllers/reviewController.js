const { z } = require('zod');
const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

const reviewSchema = z.object({
  productId: z.coerce.number().int().positive(),
  orderId: z.coerce.number().int().positive().optional().nullable(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional().nullable(),
});

const createReview = async (req, res, next) => {
  try {
    const { productId, orderId, rating, comment } = reviewSchema.parse(req.body);

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return errorResponse(res, 'Product not found', 404);

    // If orderId is provided, verify it belongs to user and is COMPLETED
    if (orderId) {
      const order = await prisma.order.findFirst({
        where: { id: orderId, userId: req.user.id },
      });
      if (!order) return errorResponse(res, 'Order not found', 404);
      if (order.orderStatus !== 'COMPLETED') {
        return errorResponse(res, 'Cannot review an uncompleted order', 400);
      }

      // Check if user already reviewed this product from this order
      const existing = await prisma.productReview.findFirst({
        where: { userId: req.user.id, productId, orderId },
      });
      if (existing) return errorResponse(res, 'You have already reviewed this product for this order', 400);
    }

    const review = await prisma.productReview.create({
      data: {
        userId: req.user.id,
        productId,
        orderId,
        rating,
        comment,
      },
      include: {
        user: { select: { id: true, fullName: true, avatar: true } },
      },
    });

    return successResponse(res, review, 'Review added successfully', 201);
  } catch (err) {
    next(err);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.productReview.findMany({
      where: { productId: parseInt(productId) },
      include: {
        user: { select: { id: true, fullName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, reviews);
  } catch (err) {
    next(err);
  }
};

module.exports = { createReview, getProductReviews };
