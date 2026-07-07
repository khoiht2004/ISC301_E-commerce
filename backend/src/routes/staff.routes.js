const router = require('express').Router();
const {
  getStaffDashboard,
  getStaffProductStats,
  getStaffSoldProducts,
} = require('../controllers/staff/staff.controller');
const {
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
} = require('../controllers/staff/staffOrderController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { ROLES } = require('../constants/roles');

router.use(authenticateToken, authorizeRoles(ROLES.STAFF, ROLES.ADMIN));

router.get('/dashboard', getStaffDashboard);
router.get('/product-stats', getStaffProductStats);
router.get('/sold-products', getStaffSoldProducts);

// ─── Order Management ────────────────────────────────────────────────────────
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/payment-status', updatePaymentStatus);

// ─── Batch Management ────────────────────────────────────────────────────────
const { getAllBatches, getBatchSuggestions, createBatch, updateBatch, deleteBatch } = require('../controllers/staff/batchController');
router.get('/batches', getAllBatches);
router.get('/batches/suggestions', getBatchSuggestions);
router.post('/batches', createBatch);
router.put('/batches/:id', updateBatch);
router.delete('/batches/:id', deleteBatch);

module.exports = router;
