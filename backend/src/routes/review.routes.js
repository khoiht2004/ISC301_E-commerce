const router = require('express').Router();
const { createReview, getProductReviews } = require('../controllers/reviewController');
const { authenticateToken } = require('../middlewares/auth');

router.get('/product/:productId', getProductReviews);
router.post('/', authenticateToken, createReview);

module.exports = router;
