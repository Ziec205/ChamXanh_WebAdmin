/**
 * Bản sao các enum dùng cho form ở phía Web Admin.
 *
 * PHẢI khớp chính xác với `BE/src/common/constants/cay-trong.const.ts` —
 * đây là giá trị gửi thẳng lên API dưới dạng chuỗi enum, không phải nhãn
 * hiển thị. Đổi bên BE thì phải đổi ở đây theo, và ngược lại.
 *
 * Lý do trùng lặp thay vì dùng chung 1 gói TypeScript: dự án chưa dựng gói
 * kiểu dữ liệu dùng chung giữa BE/FE/mobile (việc này nằm trong mục Quy
 * trình của CLAUDE.md, chưa tới lượt làm). Khi có gói dùng chung, xoá tệp
 * này và import thẳng từ đó.
 */

export const NHOM_CAY = ['cây cảnh', 'rau ăn lá', 'rau gia vị', 'cây ăn quả mini'] as const;
export type NhomCay = (typeof NHOM_CAY)[number];

export const MUC_SANG = ['bóng râm', 'sáng gián tiếp', 'nắng bán phần', 'nắng trực tiếp'] as const;
export type MucSang = (typeof MUC_SANG)[number];

export const MUC_AM = ['thấp', 'trung bình', 'cao'] as const;
export type MucAm = (typeof MUC_AM)[number];

export const MENH = ['Kim', 'Mộc', 'Thuỷ', 'Hoả', 'Thổ'] as const;
export type Menh = (typeof MENH)[number];

export const CONG_DUNG = ['lọc không khí', 'trang trí', 'ăn được', 'phong thuỷ'] as const;
export type CongDung = (typeof CONG_DUNG)[number];

export const MIEN = ['Bắc', 'Trung', 'Nam'] as const;
export type Mien = (typeof MIEN)[number];

export const NOI_DAT = [
  'trong nhà thiếu sáng',
  'gần cửa sổ',
  'ban công có mái',
  'ban công trống',
  'sân thượng',
] as const;
export type NoiDat = (typeof NOI_DAT)[number];

export const HUONG = ['Đông', 'Tây', 'Nam', 'Bắc', 'không rõ'] as const;
export type Huong = (typeof HUONG)[number];

export const DIEN_TICH = ['dưới 1m²', '1-3m²', '3-10m²', 'trên 10m²'] as const;
export type DienTich = (typeof DIEN_TICH)[number];

export const KINH_NGHIEM = [
  'chưa từng trồng',
  'mới bắt đầu',
  'đã trồng vài cây',
  'có kinh nghiệm',
] as const;
export type KinhNghiem = (typeof KINH_NGHIEM)[number];

export const THOI_GIAN_RANH = [
  'gần như không có',
  'vài phút mỗi ngày',
  '15-30 phút mỗi ngày',
  'thoải mái',
] as const;
export type ThoiGianRanh = (typeof THOI_GIAN_RANH)[number];

export const NHOM_AN_DUOC: readonly NhomCay[] = ['rau ăn lá', 'rau gia vị', 'cây ăn quả mini'];
