// Danh sách origin được phép gọi API / kết nối Socket.IO.
// Dùng chung cho cả CORS của Express (app.js) và Socket.IO (index.js) để
// tránh tình trạng 2 nơi cấu hình lệch nhau (vd: Socket.IO chỉ cho phép
// http://localhost:5173 trong khi Vite tự chuyển sang cổng 5174 khi 5173
// đã bị chiếm, gây lỗi CORS chỉ riêng cho socket.io).
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];

if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

module.exports = { allowedOrigins };
