const router = require('express').Router();
const {
  getNews,
  getLatestNews,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
} = require('../controllers/newsController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// ─── Public Routes ────────────────────────────────────────────────────────────

// IMPORTANT: /latest must be before /:slug to avoid route conflict
router.get('/latest', getLatestNews);
router.get('/', getNews);
router.get('/:slug', getNewsBySlug);

// ─── STAFF/Admin Routes ───────────────────────────────────────────────────────

router.post('/', authenticateToken, authorizeRoles('ADMIN', 'STAFF'), upload.single('thumbnail'), createNews);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'STAFF'), upload.single('thumbnail'), updateNews);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'STAFF'), deleteNews);

module.exports = router;
