import type { CongDung, Menh, MucAm, MucSang, NhomCay } from '@/lib/hang-so';

/** Một dấu hiệu bệnh — trieuChung/nguyenNhan/cachXuLy đều bắt buộc khi đã thêm dòng. */
export interface DauHieuBenh {
  trieuChung: string;
  nguyenNhan: string;
  cachXuLy: string;
}

/**
 * Toàn bộ trường của một loài cây, dùng cho cả form tạo mới lẫn sửa.
 * Khớp với CreatePlantDto/Plant schema ở BE — 33 trường.
 */
export interface DuLieuCay {
  ma: string;
  tenVi: string;
  tenEn: string;
  tenKhoaHoc: string;
  nhom: NhomCay;
  anhSangToiThieu: MucSang;
  anhSangLyTuong: MucSang;
  chuKyTuoiMuaKho: number;
  chuKyTuoiMuaMua: number;
  doSauKiemTraDat: number;
  chuKyBonPhan: number | null;
  chuKyThayDat: number | null;
  canPhunSuong: boolean;
  nhietDoNgayMin: number;
  nhietDoNgayMax: number;
  nhietDoDemMin: number;
  nhietDoDemMax: number;
  doAm: MucAm;
  anToanThuNuoi: boolean;
  ghiChuDocTinh: string;
  doKho: number;
  kichThuocChauCm: number;
  khoangCachTrongCm: number | null;
  menhPhongThuy: Menh | '';
  yNghiaPhongThuy: string;
  ngayThuHoach: number | null;
  trongXenDuocVoi: string[];
  khongTrongCungVoi: string[];
  congDung: CongDung[];
  moTaNgan: string;
  huongDanChamSoc: string;
  anhUrl: string;
  dauHieuBenhThuongGap: DauHieuBenh[];
  daKiemChung: boolean;
  dangHienThi: boolean;
}

/** Giá trị khởi tạo cho form tạo mới — chọn mặc định an toàn, dễ sửa. */
export const CAY_RONG: DuLieuCay = {
  ma: '',
  tenVi: '',
  tenEn: '',
  tenKhoaHoc: '',
  nhom: 'cây cảnh',
  anhSangToiThieu: 'bóng râm',
  anhSangLyTuong: 'sáng gián tiếp',
  chuKyTuoiMuaKho: 7,
  chuKyTuoiMuaMua: 10,
  doSauKiemTraDat: 3,
  chuKyBonPhan: null,
  chuKyThayDat: null,
  canPhunSuong: false,
  nhietDoNgayMin: 18,
  nhietDoNgayMax: 30,
  nhietDoDemMin: 16,
  nhietDoDemMax: 24,
  doAm: 'trung bình',
  anToanThuNuoi: true,
  ghiChuDocTinh: '',
  doKho: 2,
  kichThuocChauCm: 20,
  khoangCachTrongCm: null,
  menhPhongThuy: '',
  yNghiaPhongThuy: '',
  ngayThuHoach: null,
  trongXenDuocVoi: [],
  khongTrongCungVoi: [],
  congDung: [],
  moTaNgan: '',
  huongDanChamSoc: '',
  anhUrl: '',
  dauHieuBenhThuongGap: [],
  daKiemChung: false,
  dangHienThi: true,
};

/** Mục lựa chọn cho hai ô multi-select trồng xen / không trồng cùng. */
export interface MaCayLuaChon {
  ma: string;
  tenVi: string;
}
