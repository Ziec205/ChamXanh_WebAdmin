export interface NguoiDungTuApi {
  _id: string;
  email: string;
  hoTen: string;
  anhDaiDien: string;
  dangHoatDong: boolean;
  lyDoKhoa: string;
  createdAt: string;
}

export interface TrangNguoiDung {
  muc: NguoiDungTuApi[];
  tong: number;
  trang: number;
  moiTrang: number;
  soTrang: number;
}
