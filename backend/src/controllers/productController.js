const { z } = require('zod');
const slugify = require('slugify');
const prisma = require('../config/prisma');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { ROLES } = require('../constants/roles');

// ─── Validation ──────────────────────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(2, 'Tên sản phẩm là bắt buộc'),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  price: z.coerce.number().int('Giá phải là số nguyên').positive('Giá phải lớn hơn 0'),
  salePrice: z.coerce.number().int('Giá khuyến mãi phải là số nguyên').positive().optional().nullable(),
  stock: z.coerce.number().int().min(0).default(0),
  sku: z.string().optional().nullable(),
  categoryId: z.coerce.number().int().positive().optional().nullable(),
  supplierId: z.coerce.number().int().positive().optional().nullable(),
  unit: z.string().min(1).optional().default('gram'),
  weight: z.coerce.number().int().positive().optional().nullable(),
  isPublished: z.preprocess(
    (val) => (typeof val === 'string' ? val === 'true' : val),
    z.boolean().optional().default(false)
  ),
  tagIds: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return []; }
      }
      return val;
    },
    z.array(z.coerce.number().int()).optional().default([])
      // Loại trùng lặp: SQL Server không hỗ trợ `skipDuplicates` của Prisma createMany,
      // nên phải đảm bảo mảng tagIds không có phần tử lặp trước khi ghi CSDL
      .transform((arr) => [...new Set(arr)])
  ),
  rawBatchId: z.preprocess(
    (val) => (val === '' || val === 'null' || val === undefined ? null : val),
    z.coerce.number().int().positive().optional().nullable()
  ),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateSlug = async (name, excludeId = null) => {
  let slug = slugify(name, { lower: true, strict: true, locale: 'vi' });
  if (!slug) slug = `product-${Date.now()}`;
  const existing = await prisma.product.findFirst({
    where: { slug, NOT: excludeId ? { id: excludeId } : undefined },
  });
  if (existing) slug = `${slug}-${Date.now()}`;
  return slug;
};

const formatProduct = (p) => ({
  ...p,
  images: (() => { try { return JSON.parse(p.images || '[]'); } catch { return []; } })(),
  tags: p.tags?.map((pt) => pt.tag) ?? [],
});

const PRODUCT_INCLUDE = {
  tags: { include: { tag: true } },
  category: true,
  supplier: true,
  createdBy: { select: { id: true, fullName: true, avatar: true, userProfile: true } },
  rawBatch: true,
};

const applyStaffProductscope = (req, where = {}) => {
  // Staff can manage all products now, no longer restricted by createdById
  return where;
};

const canManageProduct = (req, product) =>
  req.user?.role === ROLES.ADMIN || req.user?.role === ROLES.STAFF || product.createdById === req.user?.id;

// ─── Controllers ─────────────────────────────────────────────────────────────

// GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      tagSlug,
      categorySlug,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isPublished,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where = { isDeleted: false };

    // Only show published for public; STAFF/admin can see all
    if (isPublished !== undefined) {
      where.isPublished = isPublished === 'true';
    } else {
      // default: only published for non-admin/STAFF
      where.isPublished = true;
    }

    // Filter by tag
    if (tagSlug) {
      where.tags = {
        some: { tag: { slug: tagSlug } },
      };
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    // Search by name or tag name
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim() } },
        { category: { name: { contains: search.trim() } } },
        { tags: { some: { tag: { name: { contains: search.trim() } } } } },
      ];
      // Remove isPublished from OR conflict
      delete where.isPublished;
      where.AND = [
        { isPublished: true },
        { OR: where.OR },
      ];
      delete where.OR;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice);
      if (maxPrice) where.price.lte = parseInt(maxPrice);
    }

    const allowedSortFields = ['createdAt', 'price', 'name', 'stock'];
    const orderByField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        orderBy: { [orderByField]: sortOrder === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    return paginatedResponse(res, products.map(formatProduct), total, pageNum, limitNum);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/slug/:slug
const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findFirst({
      where: { slug, isDeleted: false },
      include: PRODUCT_INCLUDE,
    });
    if (!product) return errorResponse(res, 'Không tìm thấy sản phẩm', 404);
    return successResponse(res, formatProduct(product));
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id  (numeric ID – for dashboard)
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findFirst({
      where: { id: parseInt(id), isDeleted: false },
      include: PRODUCT_INCLUDE,
    });
    if (!product) return errorResponse(res, 'Không tìm thấy sản phẩm', 404);
    return successResponse(res, formatProduct(product));
  } catch (err) {
    next(err);
  }
};

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);
    const { tagIds, ...productData } = data;

    const slug = await generateSlug(productData.name);

    let thumbnail = null;
    let images = [];
    if (req.files) {
      if (req.files['thumbnail']?.[0]) {
        thumbnail = `/${req.files['thumbnail'][0].path.replace(/\\/g, '/')}`;
      }
      if (req.files['images']) {
        images = req.files['images'].map((f) => `/${f.path.replace(/\\/g, '/')}`);
      }
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        thumbnail,
        images: JSON.stringify(images),
        createdById: req.user.id,
        tags: tagIds && tagIds.length > 0
          ? { create: tagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
      include: PRODUCT_INCLUDE,
    });

    return successResponse(res, formatProduct(product), 'Tạo sản phẩm thành công', 201);
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    const existing = await prisma.product.findFirst({ where: { id: productId, isDeleted: false } });
    if (!existing) return errorResponse(res, 'Không tìm thấy sản phẩm', 404);
    if (!canManageProduct(req, existing)) return errorResponse(res, 'Bạn chỉ có thể cập nhật sản phẩm của mình', 403);

    const data = productSchema.partial().parse(req.body);
    const { tagIds, ...productData } = data;

    if (productData.name && productData.name !== existing.name) {
      productData.slug = await generateSlug(productData.name, productId);
    }

    if (req.files) {
      if (req.files['thumbnail']?.[0]) {
        productData.thumbnail = `/${req.files['thumbnail'][0].path.replace(/\\/g, '/')}`;
      }
      if (req.files['images']) {
        productData.images = JSON.stringify(
          req.files['images'].map((f) => `/${f.path.replace(/\\/g, '/')}`)
        );
      }
    }

    // Update tags: delete all then re-create
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: productData,
      });

      if (tagIds !== undefined) {
        await tx.productTagOnProduct.deleteMany({ where: { productId } });
        if (tagIds.length > 0) {
          // Lưu ý: SQL Server không hỗ trợ `skipDuplicates` của Prisma createMany.
          // tagIds đã được loại trùng ở productSchema nên không cần flag này.
          await tx.productTagOnProduct.createMany({
            data: tagIds.map((tagId) => ({ productId, tagId })),
          });
        }
      }
    });

    const updated = await prisma.product.findUnique({
      where: { id: productId },
      include: PRODUCT_INCLUDE,
    });

    return successResponse(res, formatProduct(updated), 'Cập nhật sản phẩm thành công');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id (soft delete)
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    const existing = await prisma.product.findFirst({ where: { id: productId, isDeleted: false } });
    if (!existing) return errorResponse(res, 'Không tìm thấy sản phẩm', 404);
    if (!canManageProduct(req, existing)) return errorResponse(res, 'Bạn chỉ có thể xóa sản phẩm của mình', 403);

    await prisma.product.update({ where: { id: productId }, data: { isDeleted: true, isPublished: false } });
    return successResponse(res, null, 'Xóa sản phẩm thành công');
  } catch (err) {
    next(err);
  }
};

// PATCH /api/products/:id/publish  – toggle publish
const togglePublish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);
    const product = await prisma.product.findFirst({ where: { id: productId, isDeleted: false } });
    if (!product) return errorResponse(res, 'Không tìm thấy sản phẩm', 404);
    if (!canManageProduct(req, product)) return errorResponse(res, 'Bạn chỉ có thể công khai sản phẩm của mình', 403);

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { isPublished: !product.isPublished },
    });
    return successResponse(res, { isPublished: updated.isPublished }, `Đã ${updated.isPublished ? 'công khai' : 'gỡ công khai'} sản phẩm`);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/related?tagSlugs=...&excludeId=...
const getRelatedProducts = async (req, res, next) => {
  try {
    const { tagSlugs, excludeId, limit = 4 } = req.query;
    if (!tagSlugs) return successResponse(res, []);

    const slugsArr = tagSlugs.split(',').filter(Boolean);
    const products = await prisma.product.findMany({
      where: {
        isDeleted: false,
        isPublished: true,
        NOT: excludeId ? { id: parseInt(excludeId) } : undefined,
        tags: { some: { tag: { slug: { in: slugsArr } } } },
      },
      include: PRODUCT_INCLUDE,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, products.map(formatProduct));
  } catch (err) {
    next(err);
  }
};

// GET /api/products/all  – STAFF/admin: get all including unpublished
const getAllProductsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, categoryId, isPublished, stockStatus } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    let where = { isDeleted: false };
    where = applyStaffProductscope(req, where);
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim() } },
        { sku: { contains: search.trim() } },
      ];
    }
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (isPublished === 'true' || isPublished === 'false') {
      where.isPublished = isPublished === 'true';
    }
    if (stockStatus === 'out') where.stock = 0;
    else if (stockStatus === 'low') where.stock = { gt: 0, lte: 10 };
    else if (stockStatus === 'in') where.stock = { gt: 10 };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    return paginatedResponse(res, products.map(formatProduct), total, pageNum, limitNum);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/discount-suggestions
const getDiscountSuggestions = async (req, res, next) => {
  try {
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    const products = await prisma.product.findMany({
      where: {
        isDeleted: false,
        rawBatchId: { not: null },
        rawBatch: {
          expirationDate: {
            lte: next7Days
          }
        }
      },
      include: PRODUCT_INCLUDE,
    });

    const suggestions = products.map(product => {
      const expirationDate = new Date(product.rawBatch.expirationDate);
      const diffTime = expirationDate - today;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let suggestedDiscountPercent = 0;
      if (daysLeft <= 0) {
        suggestedDiscountPercent = 100; // Hết hạn
      } else if (daysLeft <= 3) {
        suggestedDiscountPercent = 50; // Cận date (<3 ngày)
      } else if (daysLeft <= 7) {
        suggestedDiscountPercent = 20; // Sắp cận date (<7 ngày)
      }

      const suggestedSalePrice = Math.round(product.price * (1 - suggestedDiscountPercent / 100));

      return {
        ...formatProduct(product),
        daysLeft,
        suggestedDiscountPercent,
        suggestedSalePrice,
      };
    });

    // Sort by daysLeft asc
    suggestions.sort((a, b) => a.daysLeft - b.daysLeft);

    return successResponse(res, suggestions);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  togglePublish,
  getRelatedProducts,
  getAllProductsAdmin,
  getDiscountSuggestions,
};
