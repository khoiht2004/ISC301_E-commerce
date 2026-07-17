const prisma = require('../config/prisma');
const { errorResponse, successResponse } = require('../utils/response');

// ─── User Management ─────────────────────────────────────────────────────────

// GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', role } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {
      ...(search && {
        OR: [
          { fullName: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } }
        ]
      }),
      ...(role && { role })
    };

    const users = await prisma.user.findMany({
      where,
      skip,
      take: limitNumber,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
      }
    });

    const total = await prisma.user.count({ where });

    return res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // ADMIN, STAFF, USER
    const userId = parseInt(id);

    if (!['ADMIN', 'STAFF', 'USER'].includes(role)) {
      return errorResponse(res, 'Vai trò không hợp lệ', 400);
    }

    if (userId === req.user.id) {
      return errorResponse(res, 'Bạn không thể tự thay đổi vai trò của chính mình', 400);
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return errorResponse(res, 'Không tìm thấy người dùng', 404);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true
      }
    });

    return successResponse(res, user, 'Cập nhật vai trò thành công');
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/users/:id/status
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (userId === req.user.id) {
      return errorResponse(res, 'Bạn không thể tự khóa tài khoản của chính mình', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return errorResponse(res, 'Không tìm thấy người dùng', 404);
    }

    const nextIsActive = !user.isActive;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: nextIsActive,
        // Khóa tài khoản thì hủy luôn phiên đăng nhập hiện tại (refresh token),
        // buộc phải đăng nhập lại và bị chặn ngay ở bước login/refresh
        ...(nextIsActive ? {} : { refreshToken: null, refreshTokenExpiry: null }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true
      }
    });

    return successResponse(
      res,
      updatedUser,
      updatedUser.isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản',
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (userId === req.user.id) {
      return errorResponse(res, 'Bạn không thể tự xóa tài khoản của chính mình', 400);
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return errorResponse(res, 'Không tìm thấy người dùng', 404);
    }

    // Optional: check if user has orders, etc before deleting
    // It's usually better to just block (toggleUserStatus) than hard delete

    await prisma.user.delete({
      where: { id: userId }
    });

    return successResponse(res, null, 'Xóa người dùng thành công');
  } catch (error) {
    next(error);
  }
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

// GET /api/admin/dashboard-stats
exports.getAdminDashboardStats = async (req, res, next) => {
  try {
    const usersCount = await prisma.user.count();
    const productsCount = await prisma.product.count();
    const ordersCount = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      where: { orderStatus: 'COMPLETED' },
      _sum: { totalAmount: true }
    });

    const activeComplaints = await prisma.orderComplaint.count({
      where: { status: 'PENDING' }
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderCode: true,
        totalAmount: true,
        orderStatus: true,
        createdAt: true,
        user: { select: { fullName: true } }
      }
    });

    // Top products
    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });
    const topProducts = topProductsRaw.map(p => ({
      productId: p.productId,
      productName: p.productName,
      totalSold: p._sum.quantity
    }));

    return successResponse(res, {
      users: usersCount,
      products: productsCount,
      orders: ordersCount,
      revenue: totalRevenue._sum.totalAmount || 0,
      activeComplaints,
      recentOrders,
      topProducts
    });
  } catch (error) {
    next(error);
  }
};
