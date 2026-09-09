export interface DuLieuBaiViet {
  tieuDe: string;
  duongDan: string;
  tomTat: string;
  noiDung: string;
  hinhAnh: string;
  daXuatBan: boolean;
}

export const BAI_VIET_RONG: DuLieuBaiViet = {
  tieuDe: '',
  duongDan: '',
  tomTat: '',
  noiDung: '',
  hinhAnh: '',
  daXuatBan: false,
};

export interface BaiVietTuApi extends DuLieuBaiViet {
  _id: string;
}
