import type { SanThuongMai } from '@/lib/hang-so';

export interface DuLieuLienKet {
  tieuDe: string;
  moTa: string;
  url: string;
  hinhAnh: string;
  tags: string[];
  san: SanThuongMai;
  dangHienThi: boolean;
}

export const LIEN_KET_RONG: DuLieuLienKet = {
  tieuDe: '',
  moTa: '',
  url: '',
  hinhAnh: '',
  tags: [],
  san: 'shopee',
  dangHienThi: true,
};

export interface LienKetTuApi extends DuLieuLienKet {
  _id: string;
  luotBam: number;
}
