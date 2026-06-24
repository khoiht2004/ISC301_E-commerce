const prisma = require('../../config/prisma');
const { successResponse } = require('../../utils/response');
const { ROLES } = require('../../constants/roles');

const getStaffProductWhere = (req) => {
  return { isDeleted: false };
};

const getStaffOrderItemWhere = (req) => {
  const product = getStaffProductWhere(req);

  return {
    product,
    order: {
      orderStatus: {
        not: 'CANCELLED',
      },
    },
  };
};

const buildProductStats = async (req) => {
  const productWhere = getStaffProductWhere(req);
  const orderItemWhere = getStaffOrderItemWhere(req);

  const [products, orderItems] = await Promise.all([
    prisma.product.findMany({
      where: productWhere,
      select: {
        id: true,
        name: true,
        stock: true,
        isPublished: true,
        price: true,
        salePrice: true,
      },
    }),
    prisma.orderItem.findMany({
      where: orderItemWhere,
      include: {
        order: {
          select: {
            id: true,
            orderStatus: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            stock: true,
            thumbnail: true,
          },
        },
      },
    }),
  ]);

  const orderIds = new Set(orderItems.map((item) => item.orderId));
  const soldQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const revenue = orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStockProducts = products.filter((product) => product.stock > 0 && product.stock <= 10);
  const outOfStockProducts = products.filter((product) => product.stock === 0);

  return {
    products,
    orderItems,
    summary: {
      productCount: products.length,
      publishedProductCount: products.filter((product) => product.isPublished).length,
      orderCount: orderIds.size,
      soldQuantity,
      totalStock,
      revenue,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
    },
    lowStockProducts,
    outOfStockProducts,
  };
};

const getStaffDashboard = async (req, res, next) => {
  try {
    const { summary, lowStockProducts, outOfStockProducts } = await buildProductStats(req);
    return successResponse(res, {
      summary,
      lowStockProducts,
      outOfStockProducts,
    });
  } catch (err) {
    next(err);
  }
};

const getStaffProductStats = async (req, res, next) => {
  try {
    const { summary } = await buildProductStats(req);
    return successResponse(res, summary);
  } catch (err) {
    next(err);
  }
};

const getStaffSoldProducts = async (req, res, next) => {
  try {
    const { orderItems } = await buildProductStats(req);
    const productMap = new Map();

    for (const item of orderItems) {
      const existing = productMap.get(item.productId) || {
        productId: item.productId,
        name: item.productName,
        thumbnail: item.productImage || item.product.thumbnail,
        stock: item.product.stock,
        soldQuantity: 0,
        revenue: 0,
        orderIds: new Set(),
        lastSoldAt: null,
      };

      existing.soldQuantity += item.quantity;
      existing.revenue += item.quantity * item.price;
      existing.orderIds.add(item.orderId);

      if (!existing.lastSoldAt || item.order.createdAt > existing.lastSoldAt) {
        existing.lastSoldAt = item.order.createdAt;
      }

      productMap.set(item.productId, existing);
    }

    const soldProducts = Array.from(productMap.values())
      .map((product) => ({
        ...product,
        orderCount: product.orderIds.size,
        orderIds: undefined,
      }))
      .sort((a, b) => b.soldQuantity - a.soldQuantity);

    return successResponse(res, soldProducts);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStaffDashboard,
  getStaffProductStats,
  getStaffSoldProducts,
};
