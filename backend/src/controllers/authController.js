const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const crypto = require("crypto");
const prisma = require("../config/prisma");
const { successResponse, errorResponse } = require("../utils/response");
const { sendVerificationEmail } = require("../services/mail.service");

// ─── Validation Schemas ─────────────────────────────────────────────────────

const registerSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

// ─── Token Helper ────────────────────────────────────────────────────────────

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};

const sanitizeUser = (user) => {
  const { password, verifyToken, refreshToken, refreshTokenExpiry, ...rest } =
    user;
  return rest;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return errorResponse(res, "Email đã được đăng ký", 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const verifyToken = crypto.randomUUID();

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        address: data.address,
        isVerified: false,
        verifyToken,
      },
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(user.email, verifyToken);
    if (!emailSent) {
      console.error(
        "[Register] Failed to send verification email to:",
        user.email,
      );
      // Vẫn tạo user thành công, nhưng báo lỗi gửi mail
      return successResponse(
        res,
        null,
        "Đăng ký thành công nhưng gửi email xác thực thất bại. Vui lòng dùng chức năng gửi lại email xác thực.",
        201,
      );
    }

    return successResponse(
      res,
      null, // Don't return user/token, force them to verify email first
      "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
      201,
    );
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=invalid_token`,
      );
    }

    const user = await prisma.user.findFirst({
      where: { verifyToken: token },
    });

    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=invalid_token`,
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verifyToken: null,
      },
    });

    return res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?verified=true`,
    );
  } catch (err) {
    next(err);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, "Vui lòng nhập email", 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return errorResponse(res, "Không tìm thấy người dùng", 404);
    }

    if (user.isVerified) {
      return errorResponse(res, "Tài khoản đã được xác thực", 400);
    }

    const verifyToken = crypto.randomUUID();

    await prisma.user.update({
      where: { id: user.id },
      data: { verifyToken },
    });

    const emailSent = await sendVerificationEmail(user.email, verifyToken);
    if (!emailSent) {
      return errorResponse(
        res,
        "Gửi email xác thực thất bại. Vui lòng thử lại sau.",
        500,
      );
    }

    return successResponse(res, null, "Đã gửi lại email xác thực thành công");
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) {
      return errorResponse(res, "Email hoặc mật khẩu không đúng", 401);
    }

    if (!user.isActive) {
      return errorResponse(res, "Tài khoản của bạn đã bị khóa", 403);
    }

    if (!user.isVerified) {
      return errorResponse(
        res,
        "Vui lòng xác thực email trước khi đăng nhập",
        403,
      );
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, "Email hoặc mật khẩu không đúng", 401);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to DB
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        refreshTokenExpiry: expiryDate,
      },
    });

    return successResponse(
      res,
      { user: sanitizeUser(user), accessToken, refreshToken },
      "Đăng nhập thành công",
    );
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return errorResponse(res, "Thiếu refresh token", 401);
    }

    // Verify token structure and expiry
    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      );
    } catch (err) {
      return errorResponse(res, "Refresh token không hợp lệ hoặc đã hết hạn", 401);
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (
      !user ||
      user.refreshToken !== refreshToken ||
      !user.refreshTokenExpiry ||
      user.refreshTokenExpiry < new Date()
    ) {
      return errorResponse(res, "Refresh token không hợp lệ hoặc đã hết hạn", 401);
    }

    if (!user.isActive) {
      return errorResponse(res, "Tài khoản của bạn đã bị khóa", 403);
    }

    const accessToken = generateAccessToken(user);
    // Optionally rotate the refresh token here, but we'll stick to simple access token generation for now

    return successResponse(res, { accessToken }, "Làm mới token thành công");
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    // Attempt to get user from token via middleware if possible,
    // Or from the body if they pass the refresh token
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.user.updateMany({
        where: { refreshToken },
        data: {
          refreshToken: null,
          refreshTokenExpiry: null,
        },
      });
    }

    return successResponse(res, null, "Đăng xuất thành công");
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatar: true,
        address: true,
        province_id: true,
        district_id: true,
        ward_id: true,
        street_address: true,
        receiver_phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return errorResponse(res, "Không tìm thấy người dùng", 404);
    }

    if (!user.isActive) {
      return errorResponse(res, "Tài khoản của bạn đã bị khóa", 403);
    }

    return successResponse(res, user);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const {
      fullName,
      phone,
      address,
      province_id,
      district_id,
      ward_id,
      street_address,
      receiver_phone,
    } = req.body;
    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (province_id !== undefined) updateData.province_id = province_id;
    if (district_id !== undefined) updateData.district_id = district_id;
    if (ward_id !== undefined) updateData.ward_id = ward_id;
    if (street_address !== undefined)
      updateData.street_address = street_address;
    if (receiver_phone !== undefined)
      updateData.receiver_phone = receiver_phone;
    if (req.file) updateData.avatar = `/${req.file.path.replace(/\\\\/g, "/")}`;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatar: true,
        address: true,
        province_id: true,
        district_id: true,
        ward_id: true,
        street_address: true,
        receiver_phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(res, user, "Cập nhật hồ sơ thành công");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  refresh,
  logout,
  getMe,
  updateProfile,
};
