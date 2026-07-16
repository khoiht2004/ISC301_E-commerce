const { z } = require('zod');
const slugify = require('slugify');
const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

const categorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục là bắt buộc'),
});

const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { products: { where: { isDeleted: false } } } },
      },
    });
    return successResponse(res, categories);
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name } = categorySchema.parse(req.body);
    let slug = slugify(name, { lower: true, strict: true });

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const category = await prisma.category.create({ data: { name, slug } });
    return successResponse(res, category, 'Tạo danh mục thành công', 201);
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = categorySchema.parse(req.body);
    const catId = parseInt(id);

    const existing = await prisma.category.findUnique({ where: { id: catId } });
    if (!existing) return errorResponse(res, 'Không tìm thấy danh mục', 404);

    let slug = slugify(name, { lower: true, strict: true });
    if (slug !== existing.slug) {
      const slugExists = await prisma.category.findFirst({ where: { slug, NOT: { id: catId } } });
      if (slugExists) slug = `${slug}-${Date.now()}`;
    }

    const category = await prisma.category.update({ where: { id: catId }, data: { name, slug } });
    return successResponse(res, category, 'Cập nhật danh mục thành công');
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const catId = parseInt(id);

    const productCount = await prisma.product.count({ where: { categoryId: catId, isDeleted: false } });
    if (productCount > 0) {
      return errorResponse(res, 'Không thể xóa danh mục đang có sản phẩm', 400);
    }

    await prisma.category.delete({ where: { id: catId } });
    return successResponse(res, null, 'Xóa danh mục thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
