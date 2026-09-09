import type { NhomSanPham } from '@/lib/hang-so';

export interface DuLieuSanPham {
  ten: string;
  moTa: string;
  nhom: NhomSanPham;
  gia: number;
  tonKho: number;
  hinhAnh: string[];
  dangBan: boolean;
}

export const SAN_PHAM_RONG: DuLieuSanPham = {
  ten: '',
  moTa: '',
  nhom: 'dat',
  gia: 0,
  tonKho: 0,
  hinhAnh: [],
  dangBan: true,
};

export interface SanPhamTuApi extends DuLieuSanPham {
  _id: string;
  vendorId: string;
}
