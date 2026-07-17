const { z } = require('zod');
const prisma = require('../config/prisma');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const VALID_COMPLAINT_STATUSES = ['PENDING', 'RESOLVING', 'RESOLVED', 'REJECTED'];

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
    if (!order) return errorResponse(res, 'Order not found', 404);

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

    // Notify assigned staff if exists
    if (order.assignedStaffId) {
      const io = req.app.get('io');
      if (io) {
        io.of('/chat').to(`staff_${order.assignedStaffId}`).emit('new_complaint', {
          id: result.id,
          orderId: order.id,
          orderCode: order.orderCode,
          reason: result.reason,
          createdAt: result.createdAt,
        });
      }
    }

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
    const { page = 1, limit = 10, status, search } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Toàn bộ STAFF/ADMIN đều xem được tất cả khiếu nại (giống cách quản lý đơn hàng/sản phẩm
    // hiện tại: không giới hạn theo assignedStaffId, vì phần lớn đơn COD được tự động xác nhận
    // qua performFinalCheck nên assignedStaffId thường không được set, khiến STAFF gần như
    // không bao giờ thấy khiếu nại nào nếu lọc theo staff phụ trách).
    let where = {};

    if (status && VALID_COMPLAINT_STATUSES.includes(status)) {
      where.status = status;
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      where.OR = [
        { order: { orderCode: { contains: searchTerm } } },
        { user: { fullName: { contains: searchTerm } } },
        { user: { email: { contains: searchTerm } } },
      ];
    }

    const [complaints, total] = await Promise.all([
      prisma.orderComplaint.findMany({
        where,
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true } },
          order: { select: { orderCode: true, totalAmount: true, assignedStaffId: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.orderComplaint.count({ where }),
    ]);

    return paginatedResponse(res, complaints, total, pageNum, limitNum);
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
      include: { order: { select: { orderCode: true } } },
    });

    // Notify user
    const io = req.app.get('io');
    if (io) {
      io.of('/chat').to(`user_${complaint.userId}`).emit('complaint_updated', {
        id: complaint.id,
        orderCode: complaint.order.orderCode,
        status: complaint.status,
        resolution: complaint.resolution,
      });
    }

    return successResponse(res, complaint, 'Cập nhật khiếu nại thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { createComplaint, getMyComplaints, getAllComplaints, updateComplaintStatus };
