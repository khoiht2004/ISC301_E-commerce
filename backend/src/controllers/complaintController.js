const { z } = require('zod');
const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

const complaintSchema = z.object({
  orderId: z.coerce.number().int().positive(),
  reason: z.string().min(10, 'Reason must be at least 10 characters long'),
});

const createComplaint = async (req, res, next) => {
  try {
    const { orderId, reason } = complaintSchema.parse(req.body);

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id },
    });
    if (!order) return errorResponse(res, 'Order not found', 404);

    const existing = await prisma.orderComplaint.findFirst({
      where: { orderId, userId: req.user.id },
    });
    if (existing) return errorResponse(res, 'You have already submitted a complaint for this order', 400);

    const complaint = await prisma.orderComplaint.create({
      data: {
        userId: req.user.id,
        orderId,
        reason,
        status: 'PENDING',
      },
    });

    return successResponse(res, complaint, 'Complaint submitted successfully', 201);
  } catch (err) {
    next(err);
  }
};

const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await prisma.orderComplaint.findMany({
      where: { userId: req.user.id },
      include: {
        order: { select: { orderCode: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, complaints);
  } catch (err) {
    next(err);
  }
};

const getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await prisma.orderComplaint.findMany({
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        order: { select: { orderCode: true, totalAmount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, complaints);
  } catch (err) {
    next(err);
  }
};

const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;

    const validStatuses = ['PENDING', 'RESOLVING', 'RESOLVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid status', 400);
    }

    const complaint = await prisma.orderComplaint.update({
      where: { id: parseInt(id) },
      data: { status, resolution },
    });

    return successResponse(res, complaint, 'Complaint updated');
  } catch (err) {
    next(err);
  }
};

module.exports = { createComplaint, getMyComplaints, getAllComplaints, updateComplaintStatus };
