const { z } = require('zod');
const slugify = require('slugify');
const prisma = require('../config/prisma');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

// ─── Validation Schemas ───────────────────────────────────────────────────────

const newsSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  excerpt: z.string().optional(),
  content: z.string().min(10, 'Content is required'),
  isPublished: z.union([z.boolean(), z.string()]).optional(),
});

// ─── Helper ───────────────────────────────────────────────────────────────────

const parsePublished = (val) => {
  if (val === 'true' || val === true) return true;
  if (val === 'false' || val === false) return false;
  return false;
};

// ─── NEWS CRUD ────────────────────────────────────────────────────────────────

/**
 * GET /api/news
 * Public: list published articles (paginated, searchable)
 * STAFF/Admin query param: ?all=true to see unpublished too
 */
const getNews = async (req, res, next) => {
  try {
    const { page = 1, limit = 9, search, all } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const where = {};
    // Only show published unless STAFF/admin requests all
    if (all !== 'true') {
      where.isPublished = true;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: {
          createdBy: { select: { id: true, fullName: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.news.count({ where }),
    ]);

    return paginatedResponse(res, news, total, pageNum, limitNum);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/news/latest
 * Public: Get latest 3 published articles for homepage
 */
const getLatestNews = async (req, res, next) => {
  try {
    const news = await prisma.news.findMany({
      where: { isPublished: true },
      include: {
        createdBy: { select: { id: true, fullName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    return successResponse(res, news);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/news/:slug
 * Public: Get article by slug + increment views + include reaction summary
 */
const getNewsBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const article = await prisma.news.findUnique({
      where: { slug },
      include: {
        createdBy: { select: { id: true, fullName: true, avatar: true } },
      },
    });

    if (!article) return errorResponse(res, 'Article not found', 404);
    if (!article.isPublished) return errorResponse(res, 'Article not available', 404);

    // Increment views
    await prisma.news.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });

    return successResponse(res, { ...article, views: article.views + 1 });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/news — STAFF/Admin only
 */
const createNews = async (req, res, next) => {
  try {
    const parsed = newsSchema.parse(req.body);
    const { title, excerpt, content } = parsed;
    const isPublished = parsePublished(parsed.isPublished ?? req.body.isPublished);

    let slug = slugify(title, { lower: true, strict: true });
    const existing = await prisma.news.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    let thumbnail = null;
    if (req.file) thumbnail = `/uploads/news/${req.file.filename}`;

    const article = await prisma.news.create({
      data: { title, slug, excerpt: excerpt || null, content, thumbnail, isPublished, createdById: req.user.id },
      include: { createdBy: { select: { id: true, fullName: true } } },
    });

    return successResponse(res, article, 'Article created', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/news/:id — STAFF/Admin only
 */
const updateNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = newsSchema.partial().parse(req.body);

    const existing = await prisma.news.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return errorResponse(res, 'Article not found', 404);

    const updateData = {};
    if (parsed.title) {
      updateData.title = parsed.title;
      let slug = slugify(parsed.title, { lower: true, strict: true });
      const slugExists = await prisma.news.findFirst({ where: { slug, NOT: { id: parseInt(id) } } });
      if (slugExists) slug = `${slug}-${Date.now()}`;
      updateData.slug = slug;
    }
    if (parsed.content) updateData.content = parsed.content;
    if (parsed.excerpt !== undefined) updateData.excerpt = parsed.excerpt || null;
    if (parsed.isPublished !== undefined) updateData.isPublished = parsePublished(parsed.isPublished);
    // Handle isPublished from raw body (FormData string)
    if (req.body.isPublished !== undefined && parsed.isPublished === undefined) {
      updateData.isPublished = parsePublished(req.body.isPublished);
    }
    if (req.file) updateData.thumbnail = `/uploads/news/${req.file.filename}`;

    const article = await prisma.news.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { createdBy: { select: { id: true, fullName: true } } },
    });

    return successResponse(res, article, 'Article updated');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/news/:id — STAFF/Admin only
 */
const deleteNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.news.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return errorResponse(res, 'Article not found', 404);

    await prisma.news.delete({ where: { id: parseInt(id) } });
    return successResponse(res, null, 'Article deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNews,
  getLatestNews,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
};
