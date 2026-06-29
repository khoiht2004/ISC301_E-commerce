require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Routes
const authRoutes = require("./src/routes/auth.routes");
const productRoutes = require("./src/routes/product.routes");
const tagRoutes = require("./src/routes/tag.routes");
const cartRoutes = require("./src/routes/cart.routes");
const orderRoutes = require("./src/routes/order.routes");
const newsRoutes = require("./src/routes/news.routes");
const supportRoutes = require("./src/routes/support.routes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const sepayRoutes = require("./src/routes/sepay.routes"); // POST /api/payment/sepay-webhook
const staffRoutes = require("./src/routes/staff.routes");
const reviewRoutes = require("./src/routes/review.routes");
const complaintRoutes = require("./src/routes/complaint.routes");
const supplierRoutes = require("./src/routes/supplier.routes");

// Middleware
const errorHandler = require("./src/middlewares/errorHandler");

const app = express();

// ─── Core Middleware ─────────────────────────────────────────────────────────

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/payment", sepayRoutes); // POST /api/payment/sepay-webhook (SePay webhook riêng)
app.use("/api/reviews", reviewRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/suppliers", supplierRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "🥩 Deat Lemi Shop API is running",
    version: "2.0.0",
    endpoints: [
      "GET  /api/auth/me",
      "POST /api/auth/login",
      "GET  /api/products",
      "GET  /api/products/slug/:slug",
      "GET  /api/tags",
      "POST /api/tags",
      "GET  /api/cart",
      "POST /api/cart/add",
      "GET  /api/news",
    ],
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Error Handler (must be last) ────────────────────────────────────────────

app.use(errorHandler);

module.exports = app;
