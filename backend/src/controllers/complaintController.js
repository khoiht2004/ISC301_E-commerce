const { z } = require('zod');
const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

const complaintSchema = z.object({
  orderId: z.coerce.number().int().positive(),
  reason: z.string().min(10, 'Lý do phải có ít nhất 10 ký tự'),
});

const createComplaint = async (req, res, next) => {
  try {
    const { orderId, reason } = complaintSchema.parse(req.body);

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id },
    });
    if (!order) return errorResponse(res, 'Không tìm thấy đơn hàng', 404);

    if (!['DELIVERED', 'COMPLETED'].includes(order.orderStatus)) {
      return errorResponse(res, 'Chỉ có thể yêu cầu hoàn hàng cho đơn hàng đã giao hoặc đã hoàn thành', 400);
    }

    const existing = await prisma.orderComplaint.findFirst({
      where: { orderId, userId: req.user.id },
    });
    if (existing) return errorResponse(res, 'Bạn đã gửi yêu cầu cho đơn hàng này rồi', 400);

    const result = await prisma.$transaction(async (tx) => {
      const newComplaint = await tx.orderComplaint.create({
        data: {
          userId: req.user.id,
          orderId,
          reason,
          status: 'PENDING',
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { orderStatus: 'RETURN_REQUESTED' },
      });

      return newComplaint;
    });

    return successResponse(res, result, 'Gửi yêu cầu trả hàng / hoàn tiền thành công', 201);
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
      return errorResponse(res, 'Trạng thái không hợp lệ', 400);
    }

    const complaint = await prisma.orderComplaint.update({
      where: { id: parseInt(id) },
      data: { status, resolution },
    });

    return successResponse(res, complaint, 'Cập nhật yêu cầu thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { createComplaint, getMyComplaints, getAllComplaints, updateComplaintStatus };
