# CODING RULES & GUIDELINES

Dưới đây là bộ quy tắc lập trình (Coding Rules) chuẩn chỉ dành cho dự án E-Commerce này. Bao gồm cả Backend (Node.js/Prisma) và Frontend (React/Tailwind).

## 1. GENERAL RULES (Quy tắc chung)
- **Ngôn ngữ:** Sử dụng Tiếng Anh cho tên biến, tên hàm, tên file và database. Sử dụng Tiếng Việt cho các đoạn text hiển thị ra UI cho user.
- **Naming Convention:**
  - `camelCase` cho biến, hàm (VD: `getUser`, `totalPrice`).
  - `PascalCase` cho Component, Class, Model (VD: `ProductCard`, `UserController`).
  - `kebab-case` cho tên file/folder (VD: `auth-middleware.js`, `product-route.js`) và URL (VD: `/api/v1/user-profile`).
  - `UPPER_SNAKE_CASE` cho hằng số (VD: `MAX_UPLOAD_SIZE`, `ROLES.ADMIN`).
- **Clean Code:** Viết code ngắn gọn, hàm nào ra hàm đấy (Single Responsibility). Không copy paste code lặp đi lặp lại nhiều lần (DRY - Don't Repeat Yourself).

## 2. FRONTEND (React + Vite + Tailwind)
- **Cấu trúc Component:**
  - Sử dụng Functional Component và React Hooks (`useState`, `useEffect`, v.v.). Tuyệt đối không dùng Class Component cũ kỹ.
  - Tách nhỏ component nếu file quá dài (> 200 dòng).
- **Styling (Tailwind CSS):**
  - **Bắt buộc:** Đồng bộ sử dụng **Light Theme** cho toàn bộ hệ thống (dùng nền `bg-slate-50` hoặc `bg-white`, chữ `text-slate-900`, nhấn nhá bằng màu `primary`). Không trộn lẫn Dark Theme.
  - Không viết CSS thuần (file `.css`) trừ khi bắt buộc chỉnh sửa thư viện ngoài. Tận dụng tối đa class của Tailwind.
- **Props & Eslint:**
  - Thêm dòng `/* eslint-disable react/prop-types */` ở đầu file cho các component nội bộ để tránh ESLint báo đỏ do thiếu PropTypes. (Nếu là Component tái sử dụng nhiều lần như Button, Input thì nên định nghĩa PropTypes đàng hoàng).
- **Call API:**
  - Tất cả API call phải ném qua file config `axios` instance chung của dự án (đã cấu hình sẵn interceptor).
  - Luôn phải có state `loading` và bọc `try...catch` để bắt lỗi, sau đó hiển thị Toast thân thiện cho user biết (thay vì vứt lỗi ra console).

## 3. BACKEND (Node.js + Express + Prisma)
- **Kiến trúc phân tầng (Layered Architecture):**
  - `Routes`: Chỉ khai báo path URL và gọi tới Controller tương ứng.
  - `Controllers`: Tiếp nhận Request, xác thực param ban đầu, gọi Service xử lý và trả về Response.
  - `Services`: Nơi nhét não (core logic nghiệp vụ) và gọi Database qua Prisma.
- **Response Format:** Bắt buộc chuẩn hoá JSON trả về cho mọi API. Dùng chung 1 format kiểu:
  ```json
  {
    "success": true,
    "message": "Thao tác thành công",
    "data": { ... },
    "pagination": { "page": 1, "total": 10 } // Nếu là API list
  }
  ```
- **Error Handling:**
  - Không dùng try-catch ở từng route nhỏ lẻ nếu có thiết lập async wrapper. Gom tất cả lỗi vứt về 1 cái **Global Error Handler Middleware**.
  - Trả về HTTP status code chuẩn xác (400 cho lỗi input, 401 chưa đăng nhập, 403 cấm truy cập, 404 không tìm thấy, 500 lỗi server).
- **Database (Prisma):**
  - Khai báo Model trong schema rõ ràng (PascalCase số ít: `User`, `Order`, `Product`).
  - Hạn chế `select *`. Đặc biệt khi query bảng `User`, tuyệt đối cấm trả về field `password` hay token. Phải exclude nó ra.

## 4. GIT WORKFLOW (Nên theo)
- **Commit rõ ràng:** Thêm tiền tố vào commit message để dễ quản lý:
  - `feat: Thêm tính năng giỏ hàng`
  - `fix: Sửa bug vỡ layout trang chủ`
  - `ui: Chuyển đổi màu nền sang Light Theme`
  - `refactor: Tối ưu hoá hàm tính tổng tiền`

## 5. DÀNH CHO AI ASSISTANT (Tự động)
- Luôn bám sát tông giọng "tao - mày" xấc xược nhưng giỏi kỹ thuật.
- Khi code UI, auto check và xài Light Theme bằng Tailwind.
- Nếu thấy code lặp lại quá nhiều, tự giác đề xuất tách component hoặc viết helper function.