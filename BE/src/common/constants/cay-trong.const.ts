/**
 * Bộ giá trị dùng chung cho cây trồng.
 *
 * Đây là nguồn duy nhất: tệp Excel nhập liệu, schema MongoDB, thuật toán gợi ý
 * và giao diện Web Admin đều phải khớp với danh sách ở đây. Thêm giá trị mới
 * thì phải cập nhật cả sheet "Giá trị hợp lệ" trong Document/du-lieu-cay-trong.xlsx.
 */

export const NHOM_CAY = ['cây cảnh', 'rau ăn lá', 'rau gia vị', 'cây ăn quả mini'] as const;
export type NhomCay = (typeof NHOM_CAY)[number];

/** Nhóm ăn được cần ngày thu hoạch và khoảng cách trồng; cây cảnh thì không. */
export const NHOM_AN_DUOC: readonly NhomCay[] = ['rau ăn lá', 'rau gia vị', 'cây ăn quả mini'];

/**
 * Bốn mức sáng, xếp theo thứ tự tăng dần.
 * Thứ tự trong mảng CHÍNH LÀ thang điểm dùng để so sánh — đừng đổi chỗ.
 */
export const MUC_SANG = ['bóng râm', 'sáng gián tiếp', 'nắng bán phần', 'nắng trực tiếp'] as const;
export type MucSang = (typeof MUC_SANG)[number];

export function thangSang(muc: MucSang): number {
  return MUC_SANG.indexOf(muc);
}

export const MUC_AM = ['thấp', 'trung bình', 'cao'] as const;
export type MucAm = (typeof MUC_AM)[number];

export const MENH = ['Kim', 'Mộc', 'Thuỷ', 'Hoả', 'Thổ'] as const;
export type Menh = (typeof MENH)[number];

export const CONG_DUNG = ['lọc không khí', 'trang trí', 'ăn được', 'phong thuỷ'] as const;
export type CongDung = (typeof CONG_DUNG)[number];

export const MIEN = ['Bắc', 'Trung', 'Nam'] as const;
export type Mien = (typeof MIEN)[number];

export const MUA = ['khô', 'mưa'] as const;
export type Mua = (typeof MUA)[number];

/** Nơi người dùng đặt cây — ảnh hưởng trực tiếp tới chu kỳ tưới. */
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

export const LOAI_VIEC = ['tưới', 'bón phân', 'phun sương', 'thay đất'] as const;
export type LoaiViec = (typeof LOAI_VIEC)[number];

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

/** Diện tích tối đa (cm) cho đường kính chậu, suy từ không gian người dùng khai. */
export const CHAU_TOI_DA_THEO_DIEN_TICH: Record<DienTich, number> = {
  'dưới 1m²': 20,
  '1-3m²': 30,
  '3-10m²': 45,
  'trên 10m²': 999,
};

/** Độ khó cao nhất mà người dùng nên được gợi ý, theo kinh nghiệm khai báo. */
export const DO_KHO_TOI_DA_THEO_KINH_NGHIEM: Record<KinhNghiem, number> = {
  'chưa từng trồng': 2,
  'mới bắt đầu': 3,
  'đã trồng vài cây': 4,
  'có kinh nghiệm': 5,
};

/** Chu kỳ tưới tối thiểu (ngày) mà người dùng có thể theo nổi. */
export const CHU_KY_TUOI_TOI_THIEU_THEO_THOI_GIAN: Record<ThoiGianRanh, number> = {
  'gần như không có': 10,
  'vài phút mỗi ngày': 5,
  '15-30 phút mỗi ngày': 2,
  'thoải mái': 1,
};
