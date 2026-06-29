const prisma = require("../config/prisma");
const { successResponse } = require("../utils/response");

exports.getAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: "desc" },
    });
    return successResponse(res, suppliers);
  } catch (error) {
    next(error);
  }
};
