const prisma = require('../../config/prisma');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response');

// GET /api/staff/batches
const getAllBatches = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, supplierId, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let where = {};
    if (supplierId) where.supplierId = parseInt(supplierId);
    if (search) {
      where.OR = [
        { batchCode: { contains: search } },
        { rawMaterialName: { contains: search } }
      ];
    }

    const [batches, total] = await Promise.all([
      prisma.productBatch.findMany({
        where,
        include: {
          supplier: { select: { id: true, name: true } },
          processedProducts: { select: { id: true, name: true } }
        },
        orderBy: { importDate: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.productBatch.count({ where }),
    ]);

    return paginatedResponse(res, batches, total, pageNum, limitNum);
  } catch (err) {
    next(err);
  }
};

// GET /api/staff/batches/suggestions
// Get batches that are nearing expiration (e.g. less than 30 days) to suggest discounts
const getBatchSuggestions = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + parseInt(days));

    const batches = await prisma.productBatch.findMany({
      where: {
        expirationDate: {
          lte: thresholdDate,
          gte: new Date(), // not already expired
        },
        currentQuantity: { gt: 0 } // only suggest if there is stock
      },
      include: {
        processedProducts: { select: { id: true, name: true, price: true, salePrice: true, thumbnail: true } },
        supplier: { select: { id: true, name: true } }
      },
      orderBy: { expirationDate: 'asc' }
    });

    return successResponse(res, batches, 'Đã lấy danh sách lô hàng gợi ý');
  } catch (err) {
    next(err);
  }
};

// POST /api/staff/batches
const createBatch = async (req, res, next) => {
  try {
    const { batchCode, importQuantity, costPrice, manufactureDate, expirationDate, productName, rawMaterialName, supplierId } = req.body;

    // Support both productName or rawMaterialName fields from request
    const matName = rawMaterialName || productName;

    // Validate
    if (!batchCode || !importQuantity || !costPrice || !expirationDate || !matName || !supplierId) {
      return errorResponse(res, 'Vui lòng điền đầy đủ thông tin bắt buộc', 400);
    }

    if (manufactureDate && new Date(expirationDate) <= new Date(manufactureDate)) {
      return errorResponse(res, 'Hạn sử dụng phải sau ngày sản xuất', 400);
    }

    const batch = await prisma.productBatch.create({
      data: {
        batchCode,
        importQuantity: parseInt(importQuantity),
        currentQuantity: parseInt(importQuantity),
        costPrice: parseInt(costPrice),
        manufactureDate: manufactureDate ? new Date(manufactureDate) : null,
        expirationDate: new Date(expirationDate),
        rawMaterialName: matName.trim(),
        supplierId: parseInt(supplierId),
      }
    });

    return successResponse(res, batch, 'Tạo lô hàng thành công', 201);
  } catch (err) {
    if (err.code === 'P2002') {
      return errorResponse(res, 'Mã lô hàng đã tồn tại', 400);
    }
    next(err);
  }
};

// PUT /api/staff/batches/:id
const updateBatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const batchId = parseInt(id);
    const {
      batchCode,
      importQuantity,
      currentQuantity,
      costPrice,
      manufactureDate,
      expirationDate,
      productName,
      rawMaterialName,
      supplierId
    } = req.body;

    const existingBatch = await prisma.productBatch.findUnique({ where: { id: batchId } });
    if (!existingBatch) return errorResponse(res, 'Không tìm thấy lô hàng', 404);

    // If batchCode changes, check if the new batchCode is already in use
    if (batchCode && batchCode !== existingBatch.batchCode) {
      const codeExists = await prisma.productBatch.findUnique({ where: { batchCode } });
      if (codeExists) return errorResponse(res, 'Mã lô hàng đã tồn tại', 400);
    }

    // Validate dates
    const mDate = manufactureDate !== undefined ? (manufactureDate ? new Date(manufactureDate) : null) : (existingBatch.manufactureDate ? new Date(existingBatch.manufactureDate) : null);
    const eDate = expirationDate !== undefined ? new Date(expirationDate) : (existingBatch.expirationDate ? new Date(existingBatch.expirationDate) : null);

    if (mDate && eDate && eDate <= mDate) {
      return errorResponse(res, 'Hạn sử dụng phải sau ngày sản xuất', 400);
    }

    const data = {};
    if (batchCode !== undefined) data.batchCode = batchCode;
    if (importQuantity !== undefined) data.importQuantity = parseInt(importQuantity);
    if (currentQuantity !== undefined) data.currentQuantity = parseInt(currentQuantity);
    if (costPrice !== undefined) data.costPrice = parseInt(costPrice);
    if (manufactureDate !== undefined) {
      data.manufactureDate = manufactureDate ? new Date(manufactureDate) : null;
    }
    if (expirationDate !== undefined) data.expirationDate = new Date(expirationDate);
    
    const matName = rawMaterialName || productName;
    if (matName !== undefined) data.rawMaterialName = matName.trim();
    
    if (supplierId !== undefined) data.supplierId = parseInt(supplierId);

    const updatedBatch = await prisma.productBatch.update({
      where: { id: batchId },
      data,
      include: {
        supplier: { select: { id: true, name: true } },
        processedProducts: { select: { id: true, name: true } }
      }
    });

    return successResponse(res, updatedBatch, 'Cập nhật lô hàng thành công');
  } catch (err) {
    if (err.code === 'P2002') {
      return errorResponse(res, 'Mã lô hàng đã tồn tại', 400);
    }
    next(err);
  }
};

// DELETE /api/staff/batches/:id
const deleteBatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const batchId = parseInt(id);

    const existingBatch = await prisma.productBatch.findUnique({ where: { id: batchId } });
    if (!existingBatch) return errorResponse(res, 'Không tìm thấy lô hàng', 404);

    // Gỡ liên kết sản phẩm + xóa lô hàng phải thành công/thất bại cùng nhau
    await prisma.$transaction(async (tx) => {
      // Disconnect products referring to this batch first to avoid foreign key violation
      await tx.product.updateMany({
        where: { rawBatchId: batchId },
        data: { rawBatchId: null }
      });

      await tx.productBatch.delete({
        where: { id: batchId }
      });
    });

    return successResponse(res, null, 'Xóa lô hàng thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllBatches, getBatchSuggestions, createBatch, updateBatch, deleteBatch };
