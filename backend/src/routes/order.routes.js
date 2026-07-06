const router = require('express').Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getPaymentStatus,
  getOrderByCode,
} = require('../controllers/orderController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

// ─── User Routes ──────────────────────────────────────────────────────────────
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);

// ─── Specific routes before wildcard /:id ─────────────────────────────────────
// These must come BEFORE /:id to avoid Express matching them as numeric IDs
router.get('/code/:orderCode', getOrderByCode);
router.get('/:orderCode/payment-status', getPaymentStatus);

// Wildcard by numeric id — phải đặt CUỐI
router.get('/:id', getOrderById);

module.exports = router;
