# Chạm Xanh — Web Admin

Repo này chứa **hai phần**:

| Thư mục | Là gì | Deploy lên |
|---|---|---|
| [`BE/`](BE) | API NestJS — **backend duy nhất** của cả hệ thống, phục vụ luôn cả app mobile và web giới thiệu | Render |
| [`FE/`](FE) | Web Admin bằng Next.js — nơi làm việc của Admin, Content và Support | Vercel |

Đặc tả đầy đủ nằm ở `Document/dac-ta-cham-xanh.html` trong thư mục dự án.

---

## Chạy lần đầu

Cần Node 22 trở lên và một cluster MongoDB Atlas.

### 1. Backend

```bash
cd BE
npm install
cp .env.example .env
```

Mở `.env` và điền:

- `MONGODB_URI` — lấy ở Atlas, mục *Connect → Drivers*
- `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET` — hai chuỗi **khác nhau**, mỗi chuỗi ít nhất 32 ký tự:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
  ```
- `SEED_ADMIN_EMAIL` và `SEED_ADMIN_PASSWORD` — tài khoản quản trị đầu tiên

Tạo tài khoản quản trị rồi chạy API:

```bash
npm run seed:admin
npm run dev
```

API chạy ở `http://localhost:3001/api/v1`, tài liệu Swagger ở `http://localhost:3001/api/docs`.

> Ứng dụng sẽ **dừng ngay lúc khởi động** nếu thiếu hoặc sai biến môi trường, kèm thông báo chỉ rõ biến nào. Đây là chủ ý — hỏng lúc khởi động dễ sửa hơn hỏng giữa chừng.

### 2. Web Admin

Mở cửa sổ dòng lệnh thứ hai:

```bash
cd FE
npm install
cp .env.example .env.local
npm run dev
```

Mở `http://localhost:3000` và đăng nhập bằng tài khoản vừa tạo ở bước seed.

---

## Cách xác thực hoạt động

Web Admin dùng **mẫu BFF**: trình duyệt không bao giờ chạm vào token.

```
Trình duyệt ──POST /api/auth/dang-nhap──▶ Next.js Route Handler
                                              │
                                              ├──▶ NestJS  POST /auth/dang-nhap
                                              │
                                              ◀── accessToken + refreshToken
                                              │
Trình duyệt ◀── cookie httpOnly ──────────────┘
```

- Token nằm trong cookie `httpOnly`, mã JavaScript phía client **không đọc được** — kể cả khi trang bị chèn mã độc.
- `middleware.ts` chỉ chặn ở tầng biên cho mượt trải nghiệm; **quyền thật vẫn do API quyết định** ở mỗi request.
- Refresh token là chuỗi ngẫu nhiên (không phải JWT) và chỉ lưu **bản băm** trong cơ sở dữ liệu, nên thu hồi được ngay lập tức và rò rỉ DB không đồng nghĩa mất phiên.
- Mỗi lần làm mới, token cũ bị thu hồi — xoay vòng token.

## Ba vai

| Vai | Được làm gì |
|---|---|
| `admin` | Toàn quyền: cấu hình hệ thống, giá gói, hạn mức, quản lý tài khoản quản trị |
| `content` | Nhập cây trồng, viết bài, điền nội dung trang giới thiệu |
| `support` | Xem và khoá tài khoản người dùng, duyệt hàng đợi kiểm duyệt cộng đồng |

Mặc định **mọi endpoint đều yêu cầu đăng nhập**. Muốn mở công khai phải đánh dấu `@Public()` — quên đánh dấu thì bị chặn, an toàn hơn là quên bảo vệ.

Phân quyền theo vai khai bằng `@Roles(AdminRole.Admin)` ở cấp controller hoặc từng route.

## Lệnh thường dùng

Trong `BE/`:

| Lệnh | Việc |
|---|---|
| `npm run dev` | Chạy API ở chế độ theo dõi thay đổi |
| `npm run typecheck` | Kiểm kiểu dữ liệu |
| `npm test` | Kiểm thử đơn vị |
| `npm run seed:admin` | Tạo tài khoản quản trị đầu tiên |

Trong `FE/`:

| Lệnh | Việc |
|---|---|
| `npm run dev` | Chạy Web Admin ở cổng 3000 |
| `npm run typecheck` | Kiểm kiểu dữ liệu |
| `npm run lint` | Kiểm lỗi cú pháp |
| `npm run build` | Dựng bản phát hành |

## Quy ước

- Không đẩy thẳng lên `main`. Làm trên nhánh tính năng, mở pull request, CI phải xanh.
- Tên biến và hàm viết bằng tiếng Việt không dấu (`nguoiDung`, `dangNhap`). Từ khoá kỹ thuật giữ nguyên tiếng Anh.
- Màu và kiểu chữ trong `FE/src/app/globals.css` lấy trực tiếp từ Figma. Đổi giá trị thì phải đối chiếu lại Figma trước.
