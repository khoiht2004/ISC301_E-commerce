const router = require('express').Router();
const {
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getAdminDashboardStats
} = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { ROLES } = require('../constants/roles');

router.use(authenticateToken);

// Dashboard - STAFF và ADMIN đều xem được (trang Tổng quan dùng chung)
router.get('/dashboard-stats', authorizeRoles(ROLES.STAFF, ROLES.ADMIN), getAdminDashboardStats);

// User Management - chỉ ADMIN
router.get('/users', authorizeRoles(ROLES.ADMIN), getAllUsers);
router.put('/users/:id/role', authorizeRoles(ROLES.ADMIN), updateUserRole);
router.patch('/users/:id/status', authorizeRoles(ROLES.ADMIN), toggleUserStatus);
router.delete('/users/:id', authorizeRoles(ROLES.ADMIN), deleteUser);

module.exports = router;
