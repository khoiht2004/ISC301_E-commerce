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

    return successResponse(res, batches, 'Suggested batches fetched');
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
      return errorResponse(res, 'Missing required fields', 400);
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

    return successResponse(res, batch, 'Batch created successfully', 201);
  } catch (err) {
    if (err.code === 'P2002') {
      return errorResponse(res, 'Batch code already exists', 400);
    }
    next(err);
  }
};

// PUT /api/staff/batches/:id
const updateBatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentQuantity, costPrice, expirationDate } = req.body;

    const existingBatch = await prisma.productBatch.findUnique({ where: { id: parseInt(id) } });
    if (!existingBatch) return errorResponse(res, 'Batch not found', 404);

    const data = {};
    if (costPrice !== undefined) data.costPrice = parseInt(costPrice);
    if (expirationDate !== undefined) data.expirationDate = new Date(expirationDate);
    if (currentQuantity !== undefined) {
      const diff = parseInt(currentQuantity) - existingBatch.currentQuantity;

      // Skip update if there is no change in quantity
      if (diff !== 0) {
        // Use transaction to update both batch and product stock safely
        batch = await prisma.$transaction(async (tx) => {
          const updated = await tx.productBatch.update({
            where: { id: parseInt(id) },
            data
          });

          // Sync product stock
          await tx.product.update({
            where: { id: existingBatch.productId },
            data: { stock: { increment: diff } }
          });

          return updated;
        });
      } else {
        batch = await prisma.productBatch.update({
          where: { id: parseInt(id) },
          data
        });
      }
    }

    return successResponse(res, batch, 'Batch updated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllBatches, getBatchSuggestions, createBatch, updateBatch };
