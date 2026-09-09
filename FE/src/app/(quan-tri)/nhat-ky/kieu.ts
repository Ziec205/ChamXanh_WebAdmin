export interface BanGhiNhatKy {
  _id: string;
  email: string;
  vaiTro: 'admin' | 'content' | 'support';
  hanhDong: string;
  doiTuong: string;
  maDoiTuong: string;
  truocKhi: Record<string, unknown> | null;
  sauKhi: Record<string, unknown> | null;
  thoiDiem: string;
}

export interface TrangNhatKy {
  muc: BanGhiNhatKy[];
  tong: number;
  trang: number;
  moiTrang: number;
  soTrang: number;
}

/** Các giá trị đối tượng đã biết trong hệ thống — dùng cho ô lọc. */
export const DOI_TUONG_DA_BIET = [
  { gia_tri: 'cay-trong', nhan: 'Cây trồng' },
  { gia_tri: 'khao-sat', nhan: 'Khảo sát' },
  { gia_tri: 'cau-hinh', nhan: 'Cấu hình' },
] as const;
