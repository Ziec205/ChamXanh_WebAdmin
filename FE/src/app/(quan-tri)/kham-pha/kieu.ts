import type { LoaiKhamPha } from '@/lib/hang-so';

export interface DuLieuKhamPha {
  tieuDe: string;
  tomTat: string;
  noiDung: string;
  hinhAnh: string;
  loai: LoaiKhamPha;
  tags: string[];
  daXuatBan: boolean;
}

export const KHAM_PHA_RONG: DuLieuKhamPha = {
  tieuDe: '',
  tomTat: '',
  noiDung: '',
  hinhAnh: '',
  loai: 'meo-cham-soc',
  tags: [],
  daXuatBan: false,
};

export interface KhamPhaTuApi extends DuLieuKhamPha {
  _id: string;
}
