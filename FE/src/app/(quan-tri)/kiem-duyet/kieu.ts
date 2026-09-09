import type { TrangThaiBaoCao } from '@/lib/hang-so';

export interface BaoCaoTuApi {
  _id: string;
  loaiDoiTuong: 'bai-viet' | 'binh-luan' | 'nguoi-dung';
  maDoiTuong: string;
  emailNguoiBaoCao: string;
  lyDo: string;
  trangThai: TrangThaiBaoCao;
  ghiChuXuLy: string;
  createdAt: string;
}
