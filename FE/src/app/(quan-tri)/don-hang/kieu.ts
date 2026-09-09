import type { TrangThaiDonHang } from '@/lib/hang-so';

export interface DongDonHangTuApi {
  sanPhamId: string;
  tenSanPham: string;
  gia: number;
  soLuong: number;
}

export interface DonHangTuApi {
  _id: string;
  emailKhachHang: string;
  danhSachHang: DongDonHangTuApi[];
  tongTien: number;
  phuongThucThanhToan: 'momo' | 'cod' | 'chuyen-khoan';
  trangThai: TrangThaiDonHang;
  diaChiGiao: string;
  createdAt: string;
}
