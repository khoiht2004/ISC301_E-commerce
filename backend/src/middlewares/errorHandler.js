const multer = require('multer');

/**
 * Centralized error handler middleware
 * Must be registered LAST in Express middleware chain
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Dữ liệu này đã tồn tại trong hệ thống',
      field: err.meta?.target,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy dữ liệu',
    });
  }

  // Prisma validation errors (sai kiểu dữ liệu, thiếu trường bắt buộc...)
  if (err.name === 'PrismaClientValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu gửi lên không hợp lệ',
    });
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  // Multer (upload file) errors
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: 'File vượt quá dung lượng cho phép (tối đa 5MB)',
      LIMIT_UNEXPECTED_FILE: 'Trường file không hợp lệ',
    };
    return res.status(400).json({
      success: false,
      message: messages[err.code] || 'Tải file lên thất bại',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token đã hết hạn' });
  }

  // Mặc định: không lộ chi tiết lỗi nội bộ (stack trace, thông tin CSDL...) ra ngoài
  const statusCode = err.statusCode && err.statusCode < 500 ? err.statusCode : 500;
  return res.status(statusCode).json({
    success: false,
    message: statusCode < 500 ? err.message : 'Đã có lỗi xảy ra ở máy chủ, vui lòng thử lại sau',
  });
};

module.exports = errorHandler;
