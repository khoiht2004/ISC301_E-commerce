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

router.use(authenticateToken, authorizeRoles(ROLES.ADMIN));

// Dashboard
router.get('/dashboard-stats', getAdminDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;
