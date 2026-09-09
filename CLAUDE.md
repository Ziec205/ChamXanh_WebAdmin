# Chạm Xanh

Ứng dụng mobile chăm sóc cây trồng cho người trẻ đô thị Việt Nam, kèm trợ lý AI và chợ vật tư.
Đồ án EXE202. Một lập trình viên làm toàn bộ. **Thời gian không gấp — ưu tiên chất lượng hơn tốc độ.**

Tài liệu đặc tả đầy đủ: [`Document/dac-ta-cham-xanh.html`](Document/dac-ta-cham-xanh.html)
Bản đã xuất bản: https://claude.ai/code/artifact/6516f057-caaa-4020-945d-d06a2d424efe

---

## Trạng thái hiện tại

**GĐ 0, GĐ 2, GĐ 3 xong. Web Admin đã hoàn thiện 100% menu. GĐ 1 xong phần không bị chặn.**

**81 kiểm thử đơn vị + 112 kiểm thử đầu cuối — tất cả xanh.** Typecheck, lint và build sạch cả
BE lẫn FE, kể cả `next build` production.

**Đã push lên GitHub** (ChamXanh_WebAdmin, 09/09/2026, commit `a067800`). Hai repo
ChamXanh_Mobile (`1de04d2`) và ChamXanh_WebIntroduce (`d43bcee`) vẫn ở trạng thái GĐ 0.

> **Lịch agent đám mây chưa tạo được:** API trả `HTTP 401 — Connect your GitHub account before
> saving a routine that uses a GitHub repository`. Tài khoản Claude của người dùng chưa liên kết
> GitHub. Cần vào https://claude.ai/customize/connectors kết nối trước, rồi tạo lại routine.

Đã hoàn thành:
- Chốt toàn bộ phạm vi, kiến trúc, mô hình doanh thu
- Đặc tả bộ dữ liệu cây và thuật toán gợi ý
- `Document/du-lieu-cay-trong.xlsx` — 24 loài nháp, 33 cột, 4 sheet
- Rà soát Figma, giải quyết mâu thuẫn giữa thiết kế và yêu cầu
- Khởi tạo 3 repo: `.gitignore`, `.gitattributes`, `.editorconfig`, `.nvmrc`, CI, README
- Rút design token thật từ Figma node `136:2860`
- **API NestJS**: kiểm tra biến môi trường lúc khởi động, đăng nhập email + JWT xoay vòng,
  phân quyền 3 vai, khoá tạm sau 5 lần sai, giới hạn tần suất, kiểm tra sức khoẻ, Swagger
- **GĐ 2 — dữ liệu cây và thuật toán gợi ý**:
  - `plants` (33 trường), `survey_questions`, `user_profiles`
  - Script `npm run nhap:cay` đọc thẳng từ tệp Excel, có chế độ `--thu` chỉ soát không ghi
  - Bộ chấm điểm và bộ sinh lịch viết bằng **hàm thuần**, kiểm thử không cần database
  - 9 câu hỏi khảo sát mặc định, Admin sửa nội dung được nhưng không đổi được khoá
- **GĐ 1 phần còn lại**:
  - `app_config` — hạn mức AI, giá gói, **trọng số gợi ý**, công tắc tính năng, thông báo bảo trì.
    Có bộ nhớ tạm 30 giây, xoá ngay khi Admin sửa. Trọng số đã nối thật vào bộ chấm điểm.
  - `audit_logs` — ghi ai sửa gì, kèm giá trị trước và sau. Chỉ ghi trường thật sự đổi.
    Tự dọn sau một năm. Ghi nhật ký hỏng **không được** làm hỏng thao tác nghiệp vụ.
  - Đổi mật khẩu — đổi xong thu hồi **toàn bộ** phiên, kể cả phiên hiện tại.
- **GĐ 3 — hoàn thiện Web Admin, cả 5/5 việc ưu tiên** (chi tiết ở mục riêng bên dưới):
  1. `/thu-goi-y` — thử thuật toán gợi ý không cần lập trình viên
  2. `/cay-trong/moi` + `/cay-trong/[ma]` — form thêm/sửa cây, 33 trường
  3. `/khao-sat` — quản lý câu hỏi khảo sát, sửa tại chỗ kiểu accordion
  4. `/cau-hinh` — hạn mức AI, giá gói, trọng số, công tắc tính năng, bảo trì
  5. `/nhat-ky` — xem nhật ký thao tác, lọc theo đối tượng/email
- Đồng thời vá xong lỗ hổng validation: `cay-trong` và `khao-sat` trước đây nhận
  `Partial<Plant>`/`Partial<CauHoi>` không có DTO, `ValidationPipe` không lọc được gì. Đã thêm
  `CreatePlantDto`/`UpdatePlantDto`/`CapNhatCauHoiDto` đầy đủ ràng buộc.
- **Hoàn thiện 100% menu Web Admin — 7 module còn lại** (backend + 7 trang FE, đi trước phạm vi
  gốc của GĐ 3 để không còn `chuaLam: true` nào trong `FE/src/lib/vai-tro.ts`):
  1. `/lien-ket-tiep-thi` — CRUD liên kết tiếp thị (`affiliate_links`), dẫn ra Shopee/Lazada,
     KHÔNG giữ hàng. Trợ lý AI chỉ chọn `tags`, không thấy URL.
  2. `/kham-pha` — CRUD nội dung khám phá (`discover_items`): mẹo chăm sóc, kiến thức, thủ thuật
  3. `/trang-gioi-thieu` — CRUD bài viết (`articles`), `duongDan` (slug) không đổi được sau khi tạo
  4. `/san-pham` — CRUD sản phẩm Chợ Vật Tư (`products`), có tồn kho, gắn sẵn `vendorId`
  5. `/nguoi-dung` — tra cứu + khoá/kích hoạt tài khoản người dùng app (`users`, schema tối
     thiểu — sẽ khớp lại khi GĐ 5 dựng luồng đăng ký thật)
  6. `/kiem-duyet` — hàng đợi báo cáo vi phạm (`reports`), xử lý/bỏ qua (Apple 1.2)
  7. `/don-hang` — xem đơn + đổi trạng thái (`orders`), có kiểm tra chuyển trạng thái hợp lệ
     (không nhảy cóc, không lùi sau khi hoàn thành/huỷ)

  `nguoi-dung`, `kiem-duyet`, `reports` là **lớp quản trị đi trước** — collection thật
  (`users`, `posts`, `comments`) chưa tồn tại vì mobile (GĐ 5) và cộng đồng (GĐ 8) chưa dựng.
  Schema hiện tại là suy đoán hợp lý theo "Cấu trúc dữ liệu", cần đối chiếu lại khi hai giai
  đoạn đó thật sự triển khai. `don-hang` tương tự — chưa có luồng đặt đơn thật (GĐ 7), Admin
  hiện chỉ quản lý trạng thái.

## Việc kế tiếp

**Toàn bộ menu Web Admin đã hoàn thiện — không còn `chuaLam: true` nào trong
`FE/src/lib/vai-tro.ts`.** Việc kế tiếp hợp lý là bắt đầu **GĐ 5 — ứng dụng mobile lõi chăm
cây** (khảo sát, vườn của tôi, lịch chăm sóc — các API đã sẵn sàng từ GĐ 1-3) hoặc **GĐ 4 —
web giới thiệu công khai** (đọc dữ liệu từ `/trang-gioi-thieu` đã có), xem bảng "Trình tự dựng"
ở dưới. Sau khi hai giai đoạn đó triển khai, quay lại đối chiếu schema `nguoi-dung`/`kiem-duyet`/
`don-hang` với dữ liệu thật thay vì suy đoán như hiện tại.

### Còn bị chặn bởi phụ thuộc bên ngoài
- Đăng nhập Google và Apple — cần tài khoản nhà phát triển
- Xoá tài khoản người dùng app (Apple 5.1.1v) — cần collection `users`, thuộc GĐ 5
- Quên mật khẩu qua Resend — cần tên miền để thư không vào hộp rác
- Agent đám mây chạy theo lịch — cần liên kết GitHub với tài khoản Claude

Chưa làm: mua tài khoản Apple / Google Developer, tên miền.

### Chạy thử ngay

```bash
cd ChamXanh_WebAdmin/BE && npm install && cp .env.example .env
# điền MONGODB_URI và hai chuỗi JWT khác nhau, mỗi chuỗi ≥ 32 ký tự:
#   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
npm run seed:admin && npm run nhap:cay && npm run dev   # cổng 3001

cd ../FE && npm install && cp .env.example .env.local
npm run dev                                              # cổng 3000
```

API ở `http://localhost:3001/api/v1`, Swagger ở `http://localhost:3001/api/docs`.

### Lệnh kiểm chứng — chạy TRƯỚC mỗi lần commit, tất cả phải xanh

```bash
# BE
npx tsc --noEmit && npx jest && npx jest --config ./test/jest-e2e.json --runInBand && npx nest build
# FE
npx tsc --noEmit && npx next lint && npx next build
```

Kiểm thử đầu cuối tự dựng MongoDB trong bộ nhớ (`test/global-setup.ts`), **không cần** `.env`
lẫn cơ sở dữ liệu thật. `npm run nhap:cay -- --thu` cũng chạy được mà không cần cấu hình gì.

---

## Bản đồ mã nguồn

Ở đâu tìm gì trong `ChamXanh_WebAdmin/`:

| Việc cần làm | Tệp |
|---|---|
| Thuật toán chấm điểm gợi ý (hàm thuần) | `BE/src/modules/goi-y/cham-diem.ts` |
| Suy ra mức sáng từ vị trí + hướng | `BE/src/modules/goi-y/suy-ra-the.ts` |
| Sinh lịch chăm sóc (hàm thuần) | `BE/src/modules/lich-cham-soc/sinh-lich.ts` |
| Mọi enum dùng chung (mức sáng, nhóm cây, mệnh…) | `BE/src/common/constants/cay-trong.const.ts` |
| Bộ câu hỏi khảo sát mặc định | `BE/src/modules/khao-sat/du-lieu/cau-hoi-mac-dinh.ts` |
| Nhập dữ liệu từ Excel | `BE/src/scripts/nhap-cay-trong.ts` |
| Hệ thiết kế (màu, chữ, component) | `FE/src/app/globals.css` |
| Khai báo menu và quyền theo vai | `FE/src/lib/vai-tro.ts` |
| Gọi API từ phía server Next.js | `FE/src/lib/api.ts` |
| Nút xoá dùng chung (hỏi xác nhận + gọi Server Action) | `FE/src/components/nut-xoa.tsx` |
| Bản sao enum của BE cho dropdown form (đối chiếu tự động, khớp 100%) | `FE/src/lib/hang-so.ts` |
| Định dạng ngày/tiền dùng chung | `FE/src/lib/dinh-dang.ts` |
| Form thêm/sửa cây, 33 trường chia 11 khối | `FE/src/app/(quan-tri)/cay-trong/form-cay.tsx` |
| Form thử thuật toán gợi ý | `FE/src/app/(quan-tri)/thu-goi-y/form-thu-goi-y.tsx` |
| Sửa câu hỏi khảo sát tại chỗ (accordion) | `FE/src/app/(quan-tri)/khao-sat/the-cau-hoi.tsx` |
| 5 khối cấu hình, mỗi khối tự lưu riêng | `FE/src/app/(quan-tri)/cau-hinh/form-cau-hinh.tsx` |

**Hàm thuần là chỗ đặt logic.** `cham-diem.ts` và `sinh-lich.ts` không đụng database, nên kiểm thử
được đầy đủ trường hợp biên mà không cần dựng Mongo. Thêm luật mới thì thêm vào đó, đừng nhét
vào service.

### Mẫu mutation ở Web Admin — Server Action, không phải Route Handler

Mọi form sửa dữ liệu (thêm/sửa cây, sửa câu hỏi, sửa cấu hình) dùng **Next.js Server Action**
(`'use server'` trong một tệp `actions.ts` cạnh `page.tsx`), KHÔNG viết thêm Route Handler
proxy trong `app/api/*` — Server Action chạy trên server nên gọi thẳng `goiApi()` (đã đọc cookie
httpOnly) y hệt các trang chỉ đọc. Route Handler chỉ tồn tại cho hai việc: đăng nhập/đăng xuất
(nơi cookie được **đặt** lần đầu, phải qua `NextResponse.cookies.set`).

Mẫu chuẩn một action:
```ts
'use server';
import { goiApi, LoiApi } from '@/lib/api';

export async function suaX(id: string, du_lieu: DuLieu): Promise<{thanhCong:true}|{thanhCong:false;loi:string}> {
  try {
    await goiApi(`/duong-dan/${id}`, { method: 'PATCH', body: JSON.stringify(du_lieu) });
  } catch (e) {
    return { thanhCong: false, loi: (e as LoiApi).message ?? 'Không lưu được.' };
  }
  revalidatePath('/duong-dan');
  return { thanhCong: true };
}
```
Không bao giờ ném lỗi thẳng ra Client Component — luôn bắt và trả `{thanhCong:false, loi}` để
form tự hiện banner `.bao-loi`, người dùng không thấy màn trắng lỗi Next.js.

**Kiểm thử Server Action không dùng Jest được** (cần trình duyệt để lấy action ID). Cách đã dùng
trong phiên này: build production (`next build`) rồi đọc action ID thật từ
`.next/server/server-reference-manifest.json`, gọi thẳng qua giao thức `Next-Action` bằng curl
(header `Next-Action: <id>`, body là `JSON.stringify([...cácThamSố])`). Xem lịch sử commit GĐ 3
để thấy ví dụ đầy đủ.

### Quy ước API

- Tiền tố: `api/v1`. Phản hồi **luôn** được bọc bởi interceptor toàn cục:
  - Thành công: `{ thanhCong: true, duLieu: <kết quả> }`
  - Lỗi: `{ thanhCong: false, maLoi, thongBao, duongDan, thoiDiem }`
  - ⚠️ Trong kiểm thử **đừng** đăng ký lại filter/interceptor — `AppModule` đã đăng ký toàn cục,
    đăng ký lần nữa sẽ bọc phản hồi hai lớp (`duLieu.duLieu`). Đã từng mắc lỗi này.
- Mặc định **mọi endpoint yêu cầu đăng nhập**. Mở công khai phải đánh dấu `@Public()`.
- Phân quyền: `@Roles(AdminRole.Admin)` ở cấp controller hoặc từng route.
- **Endpoint nào sửa dữ liệu đều phải ghi `NhatKyService.ghi()`** kèm giá trị trước và sau.
- Web Admin dùng mẫu BFF: token nằm trong cookie `httpOnly` tên `cx_access` và `cx_refresh`,
  do Route Handler `FE/src/app/api/auth/*` đặt. Trình duyệt không bao giờ chạm vào token.

### Endpoint đã có

| Nhóm | Đường dẫn |
|---|---|
| Xác thực | `POST auth/dang-nhap` · `auth/lam-moi` · `auth/dang-xuat` · `auth/doi-mat-khau` · `GET auth/toi` |
| Tài khoản quản trị | `GET/POST admin-users` · `PATCH admin-users/:id/vo-hieu-hoa` · `/kich-hoat` |
| Cây trồng | `GET cay-trong` · `cay-trong/thong-ke` · `cay-trong/:ma` · `POST cay-trong` · `PATCH cay-trong/:ma` |
| Khảo sát | `GET khao-sat/cau-hoi` · `/tat-ca` · `PATCH khao-sat/cau-hoi/:khoa` · `POST /nap-mac-dinh` |
| Gợi ý | `POST goi-y` |
| Cấu hình | `GET cau-hinh` · `PATCH cau-hinh` |
| Nhật ký | `GET nhat-ky` |
| Liên kết tiếp thị | `GET/POST lien-ket-tiep-thi` · `GET/PATCH/DELETE lien-ket-tiep-thi/:id` |
| Khám phá | `GET/POST kham-pha` · `GET/PATCH/DELETE kham-pha/:id` |
| Trang giới thiệu | `GET/POST trang-gioi-thieu` · `GET/PATCH/DELETE trang-gioi-thieu/:duongDan` |
| Sản phẩm | `GET/POST san-pham` · `GET/PATCH/DELETE san-pham/:id` |
| Người dùng app | `GET nguoi-dung` · `GET nguoi-dung/:id` · `PATCH /:id/khoa` · `/:id/kich-hoat` |
| Kiểm duyệt | `GET kiem-duyet` · `PATCH kiem-duyet/:id` |
| Đơn hàng | `GET don-hang` · `GET don-hang/:id` · `PATCH don-hang/:id/trang-thai` |
| Sức khoẻ | `GET health` (công khai) |

---

## Kiến trúc

```
ChamXanh_Mobile          React Native + Expo    → Google Play / App Store
ChamXanh_WebAdmin/BE     NestJS + TypeScript    → Render (gói trả phí)   ← API DUY NHẤT
ChamXanh_WebAdmin/FE     Next.js + TypeScript   → Vercel
ChamXanh_WebIntroduce/BE Route Handler Next.js  → Vercel (KHÔNG phải NestJS riêng)
ChamXanh_WebIntroduce/FE Next.js                → Vercel
                         MongoDB Atlas          ← dùng chung, gồm cả ảnh qua GridFS
```

Ba repo GitHub tương ứng ba thư mục cấp một:
- https://github.com/Ziec205/ChamXanh_Mobile.git
- https://github.com/Ziec205/ChamXanh_WebAdmin.git
- https://github.com/Ziec205/ChamXanh_WebIntroduce.git

**Luồng cập nhật tức thì:** Admin bấm Lưu → API ghi Mongo → gọi webhook `revalidatePath` của Vercel → web giới thiệu dựng lại ngay. Ứng dụng luôn fetch từ API nên mở app là thấy bản mới.

---

## Công nghệ và dịch vụ

| Hạng mục | Chọn | Ghi chú |
|---|---|---|
| Mobile | React Native + Expo | EAS Build, EAS Update, Expo Push |
| Backend | NestJS + TypeScript + Mongoose | |
| Web | Next.js + TypeScript | App Router |
| CSDL | MongoDB Atlas | Nhà trường trả phí |
| Ảnh | GridFS trong MongoDB | Qua lớp `StorageService` 2 driver |
| Email | Resend | Xác minh + quên mật khẩu |
| LLM | Claude API | Sonnet cho hỏi đáp, Haiku cho tác vụ nền |
| Thông báo | Expo Push Notifications | |
| Theo dõi lỗi | Sentry | Backend + mobile |
| CI | GitHub Actions | Cả ba repo |

**Toàn bộ phí dịch vụ do nhà trường chi trả** (Render, Vercel, MongoDB, Claude API...). Không tối ưu theo hướng tiết kiệm chi phí hạ tầng. Nhưng **vẫn phải có giới hạn tần suất** cho endpoint AI — token bị lộ có thể đốt sạch hạn mức tài trợ trong một đêm.

---

## Phạm vi

### Có làm
- Khảo sát nhập môn nhiều bước → gợi ý cây theo không gian sống
- Vườn của tôi, lịch chăm sóc bốn loại việc, nhắc nhở qua push
- Giỏ Chờ Chăm Sóc, hướng dẫn thao tác từng bước, trồng xen canh
- Khám phá cây trồng — nội dung Admin cập nhật hằng ngày
- **Trợ lý AI** hỏi đáp bằng chữ + gợi ý **liên kết tiếp thị** dẫn ra Shopee/Lazada
- **Chợ Vật Tư** — module RIÊNG, bán hàng của chính Chạm Xanh, có tồn kho và giao nhận
- Cộng đồng: đăng bài, thích, bình luận, báo cáo, chặn
- Nhắn tin riêng realtime qua WebSocket
- Gói 39k (70 câu/tháng) và 69k (150 câu/tháng)
- Song ngữ Việt–Anh
- Web giới thiệu 5 trang + Chính sách bảo mật + Điều khoản

### Không làm
- **Nhận diện cây / chẩn bệnh qua ảnh** — màn "Trợ lý AI chẩn bệnh" trong Figma chuyển thành mô tả triệu chứng bằng chữ + chip chọn nhanh (lá vàng, đốm nâu, héo rũ, rụng lá)
- **Nhánh Farmiant** (IoT: cảm biến đất, tưới tự động, trạm thời tiết) — hướng phát triển tương lai, chừa chỗ trong schema, không code
- **Sàn nhiều người bán** — nhưng gắn sẵn `vendorId` vào `products` và `orders`
- Gọi thoại, tạo giọng nói, Creative Writings

---

## Nhật ký quyết định

Ghi lại **lý do**, để phiên sau không lật lại những gì đã cân nhắc kỹ.

| Quyết định | Lý do |
|---|---|
| **Một backend, không phải hai** | Ban đầu định 2 NestJS riêng. Nhưng cả hai dùng chung 1 MongoDB → 2 bộ Mongoose schema mô tả cùng collection, ở 2 repo khác nhau, không share type được → chắc chắn lệch. Next.js chạy server được nên WebIntroduce/BE thành Route Handler. Bonus: SEO tốt hơn, bớt 1 cold start. |
| **Ảnh lưu trong MongoDB** | Người dùng chọn, đã được cảnh báo về giới hạn dung lượng và việc không có CDN. Nhà trường trả phí Atlas nên lập luận chi phí không còn. Vẫn viết `StorageService` 2 driver (`mongo` mặc định, `cloudinary`) để đổi bằng biến môi trường nếu feed chậm. |
| **Render gói trả phí, không dùng free** | Free tier ngủ sau 15 phút, tỉnh mất ~50s. Phá vỡ yêu cầu cứng "mở app là thấy ngay". |
| **MoMo bán gói CHỈ trên web, không trong app** | Apple 3.1.1 và Google Play Billing đều bắt buộc dùng thanh toán của kho cho nội dung số. Bán quota AI bằng MoMo trong app = bị gỡ. Nhưng **hàng vật lý thì được** — nên Chợ Vật Tư dùng MoMo/COD trong app hoàn toàn hợp lệ. |
| **LLM không được thấy URL affiliate** | Model sẽ bịa URL và sửa mã affiliate → mất hoa hồng. Dùng tool `tim_san_pham(tags)`: Claude chỉ chọn thẻ, backend query `affiliate_links` rồi ghép link thật, trả về card có cấu trúc. |
| **Gợi ý cây bằng luật, không bằng LLM** | Cần kết quả ổn định, chi phí bằng 0, và câu giải thích đúng thật. Trọng số nằm trong `app_config` để Admin tinh chỉnh. |
| **Cá nhân ra khỏi thanh tab** | Apple HIG và Material đều giới hạn 5 tab. Có 6 khu vực. Figma đã sẵn ảnh đại diện góc trên trái ở màn Trang chủ → Cá nhân vào đó. Cộng đồng được giữ tab vì dùng hằng ngày. |
| **Một người bán, nhưng có `vendorId`** | Nhiều người bán cần pháp nhân để chia tiền, +80h. Con đường chuẩn là bắt đầu đơn lẻ rồi mở dần. Gắn `vendorId` từ đầu để sau này thêm giao diện chứ không phải chuyển đổi dữ liệu. |
| **Tài khoản admin tách khỏi tài khoản người dùng** | Collection `admin_users` riêng. Rò rỉ DB người dùng không kéo theo quyền quản trị. |
| **Trường tiếng Anh không bắt buộc cho nội dung** | Giao diện song ngữ đầy đủ (rẻ). Nhưng bắt Content nhập 2 lần cho mỗi loài cây sẽ làm chậm gấp đôi việc xây dữ liệu. Thiếu EN thì fallback về VI. |

---

## Điều hướng ứng dụng

Năm tab, nhãn dùng thống nhất (Figma hiện đặt tên không nhất quán — bộ dưới là bản chốt):

| # | Tiếng Việt | Tiếng Anh |
|---|---|---|
| 1 | Trang chủ | Home |
| 2 | Vườn | Garden |
| 3 | Trợ lý | Assistant |
| 4 | Chợ | Shop |
| 5 | Cộng đồng | Community |
| — | Cá nhân | Profile — qua ảnh đại diện góc trên trái |

---

## Cấu trúc dữ liệu

Collection chính, nhóm theo miền nghiệp vụ:

- **Tài khoản** — `users`, `admin_users`, `refresh_tokens`, `email_verifications`
- **Khảo sát & gợi ý** — `survey_questions`, `user_profiles`, `plants`
- **Vườn & chăm sóc** — `user_plants`, `care_tasks`, `care_guides`, `care_basket`
- **Nội dung** — `discover_items`, `articles`, `landing_pages`, `app_config`
- **Trợ lý AI** — `conversations`, `affiliate_links`, `ai_usage`
- **Chợ Vật Tư** — `products`, `carts`, `addresses`, `orders`
- **Cộng đồng** — `posts`, `comments`, `reports`, `dm_threads`, `dm_messages`
- **Hệ thống** — `notifications`, `audit_logs`, `analytics_events`

`affiliate_links` và `products` là **hai collection tách biệt, không dùng chung mã nguồn**. Affiliate = dẫn ra sàn ngoài, không giữ hàng. Products = hàng của Chạm Xanh, có tồn kho.

Bộ trường đầy đủ của `plants`: xem `Document/du-lieu-cay-trong.xlsx` (33 cột) và mục "Bộ dữ liệu cây" trong đặc tả.

---

## Thuật toán gợi ý cây

Bộ lọc cứng trước, rồi chấm điểm:

1. **Loại thẳng** nếu người dùng có chó mèo và cây độc (`anToanThuNuoi = không`)
2. **Loại thẳng** nếu chỗ đặt tối hơn `anhSangToiThieu`

| Tiêu chí | Trọng số |
|---|---|
| Ánh sáng (trùng mức lý tưởng = điểm đầy) | 30 |
| Thời gian rảnh ↔ chu kỳ tưới | 20 |
| Kinh nghiệm ↔ độ khó | 15 |
| Diện tích ↔ kích thước chậu | 15 |
| Mục đích ↔ công dụng | 10 |
| Mệnh phong thuỷ | 10 |

Trả về 6 loài điểm cao nhất, mỗi loài kèm câu giải thích ghép từ chính các tiêu chí đã cộng điểm.
Trọng số nằm trong `app_config`, Admin chỉnh được, mọi thay đổi ghi vào `audit_logs`.

**Sinh lịch chăm sóc:** từ chu kỳ của loài, điều chỉnh theo mùa hiện tại + miền người dùng + vị trí đặt cây. Bốn loại việc (tưới, bón, phun sương, thay đất) là bốn dòng lịch riêng.

---

## Quy tắc hạn mức AI

- 1 câu = 1 tin nhắn người dùng **có gọi tới model**. Tin bị bộ lọc chặn (quá ngắn, trùng lặp) không trừ.
- Tối đa **10 lượt mỗi hội thoại**, sau đó mở hội thoại mới kèm tóm tắt ngắn — chặn chi phí phình theo ngữ cảnh.
- Hạn mức reset sau **30 ngày kể từ ngày kích hoạt gói**, không cộng dồn.
- Hạn mức miễn phí đặt trong `app_config`, Admin chỉnh không cần phát hành lại app.
- **Giới hạn cứng ở backend: tối đa 10 câu/giờ/tài khoản.**

---

## Quy trình và chuẩn chất lượng

- **Nhánh:** không đẩy thẳng lên `main`. Làm trên nhánh tính năng, mở PR, CI phải xanh.
- **CI:** GitHub Actions trên cả ba repo — lint, typecheck, test trên mỗi PR.
- **Kiểu dữ liệu dùng chung:** một gói TypeScript chứa type và hằng số, dùng chung giữa API, Web Admin, mobile.
- **Kiểm thử bắt buộc:** thuật toán chấm điểm gợi ý, bộ sinh lịch chăm sóc, bộ đếm hạn mức — ba chỗ sai thầm lặng mà người dùng không báo lỗi. Luồng API chính có test đầu cuối.
- **Khả năng tiếp cận:** nhãn cho trình đọc màn hình, vùng chạm ≥ 44pt, tương phản đạt AA, tôn trọng cỡ chữ hệ thống.
- **Hiệu năng:** nén ảnh trước khi tải lên, cuộn ảo cho danh sách dài, đánh chỉ mục Mongo cho mọi truy vấn có lọc.

---

## Trình tự dựng

| GĐ | Nội dung | Mốc kiểm chứng |
|---|---|---|
| 0 | Chuẩn bị, repo, CI, design token, dữ liệu cây mẫu | CI xanh cả ba repo, dữ liệu cây trong Mongo |
| 1 | Nền tảng API: auth, RBAC, xoá tài khoản, config | Toàn bộ luồng xác thực có test tự động |
| 2 | Dữ liệu cây, khảo sát, thuật toán gợi ý, sinh lịch | Test đơn vị phủ các trường hợp biên |
| 3 | Web Admin | Người không phải dev tự nhập trọn một loài cây |
| 4 | CMS + web giới thiệu | Sửa Admin → trang công khai đổi trong vài giây |
| 5 | Ứng dụng — lõi chăm cây | Dùng thật 7 ngày liên tục, không mất dữ liệu |
| 6 | Trợ lý AI + affiliate | 30 câu hỏi thật, không câu nào bịa link |
| 7 | Chợ Vật Tư | Đặt đơn thật từ đầu đến cuối, tồn kho trừ đúng |
| 8 | Cộng đồng + nhắn tin | Hai máy nhắn tin thấy nhau tức thì |
| 9 | Hoàn thiện và phát hành | Được duyệt trên cả hai kho |

Khoảng 24 tuần nếu làm liên tục.

---

## Bắt buộc để được duyệt store

Thiếu bất kỳ mục nào là bị từ chối, dù phần còn lại hoàn hảo:

- **Xoá tài khoản ngay trong app** — Apple 5.1.1(v) — GĐ 1
- **Sign in with Apple** khi đã có Google Sign-In — Apple 4.8 — GĐ 1
- **URL công khai** Chính sách bảo mật + Điều khoản — cả hai kho — GĐ 4
- **Báo cáo vi phạm, chặn người dùng, lọc nội dung, email liên hệ công khai** — Apple 1.2 — GĐ 8
- **IAP / Play Billing** cho nội dung số — Apple 3.1.1 — GĐ 9
- **Khai báo App Privacy / Data Safety** + phân loại độ tuổi — GĐ 9

---

## Cạm bẫy đã biết

- **Google Sign-In và Sign in with Apple không chạy trên Expo Go** — phải làm EAS dev build từ GĐ 5.
- **Build iOS cần máy Mac hoặc EAS Build** (bản free giới hạn số lượt build/tháng).
- **Cổng MoMo doanh nghiệp có thể cần giấy phép kinh doanh** — chưa xác minh. Nếu không có: chỉ COD + chuyển khoản kèm mã đơn, đối soát thủ công.
- **Bán hàng thật cần vốn nhập hàng, kho, đóng gói, vận chuyển** — nhà trường tài trợ hạ tầng, không tài trợ tồn kho. Nên mở bán bằng nhóm hàng không hỏng: đất, phân, chậu, hạt giống, dụng cụ. Cây sống để sau.
- **Xét duyệt tài khoản Apple mất 1–2 tuần** — GĐ 9 phụ thuộc hoàn toàn vào việc này.
- **Cộng đồng chưa có thiết kế nào trong Figma** — phải thiết kế 6 màn mới, đưa vào Figma duyệt trước khi code.

---

## Figma

https://www.figma.com/design/3mz5geRdEChBxsXt272UJA/Ch%E1%BA%A1m-xanh

⚠️ **File chứa 4 tầng nội dung trộn lẫn.** Chỉ tầng 3 là Chạm Xanh thật:

1. UI kit mua sẵn — app chatbot AI (57 màn 375×812: `01_Splash` → `57_Logout`) — **tham khảo**
2. UI kit mua sẵn — e-commerce (402×874: `22_Categories`, `26_Product Details`, `27–36_Checkout`, `37_My Orders`) — **tham khảo**
3. **Thiết kế Chạm Xanh thật** (tiếng Việt, 390/402px) — dùng cái này
4. "Farmiant" — dashboard IoT, khác thương hiệu — **bỏ qua**

Node ID các màn Chạm Xanh chính:

| Màn | Node |
|---|---|
| Trang chủ | `136:2860` |
| Chợ Vật Tư | `136:2733` |
| Sản Phẩm Chăm Sóc | `136:2626` |
| Chi Tiết Sản Phẩm | `702:3236` |
| Giỏ Hàng | `702:3323` |
| Thanh toán | `136:3739` |
| Thêm địa chỉ mới | `136:3844` |
| Trợ lý AI | `136:2979` |
| Trợ lý AI chẩn bệnh | `136:3946` |
| Giỏ Chờ Chăm Sóc | `136:3098` |
| Nhắc nhở Thay đất | `136:3209` |
| Thông báo Đẩy | `136:3228` |
| Điều hướng | `136:2544` |
| Onboarding 1/2/3 | `136:2444` / `136:2409` / `136:2474` |
| Kết quả khảo sát | `291:4380` |
| Khảo sát tâm lý 1 | `416:2947` |

Hệ màu lấy từ bản render (file chưa khai báo Figma variable): xanh lá tươi ≈ `#6FA83C`, xanh rừng ≈ `#24462A`, nền ≈ `#F6F7F3`.

---

## Thư mục Document

| Tệp | Nội dung |
|---|---|
| `dac-ta-cham-xanh.html` | Đặc tả kỹ thuật đầy đủ — nguồn sự thật |
| `du-lieu-cay-trong.xlsx` | Bảng nhập dữ liệu cây · 33 cột · 24 loài nháp · 4 sheet |

**Bản sao trong repo:** `CLAUDE.md` và `Document/` được nhân bản vào `ChamXanh_WebAdmin/`, vì agent
đám mây và người clone lẻ repo đó không thấy được thư mục gốc trên máy. **Bản ở thư mục gốc này là
bản chính** — sửa ở đây trước rồi đồng bộ sang. Script `nhap:cay` tự tìm tệp Excel ở cả hai bố cục.

**Về file Excel:** 24 dòng có sẵn là **dữ liệu nháp do máy soạn**, cột `daKiemChung` đang để `không`. Phải có người thật đối chiếu ít nhất hai nguồn đáng tin cậy trước khi đổi thành `có` và đưa vào dùng thật.

---

## Ngôn ngữ giao tiếp

Trao đổi với người dùng **bằng tiếng Việt**.
