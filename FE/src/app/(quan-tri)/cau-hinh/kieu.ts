export interface HanMucAI {
  mienPhi: number;
  goiCoBan: number;
  goiNangCao: number;
  soLuotMoiHoiThoai: number;
  soCauMoiGio: number;
}

export interface GiaGoi {
  coBan: number;
  nangCao: number;
}

export interface TrongSoGoiY {
  anhSang: number;
  thoiGian: number;
  kinhNghiem: number;
  dienTich: number;
  mucDich: number;
  phongThuy: number;
}

export interface ThongBaoBaoTri {
  dangBat: boolean;
  noiDung: string;
}

/** Năm công tắc mặc định do BE định nghĩa — xem cau-hinh.schema.ts. */
export interface CongTacTinhNang {
  choVatTu: boolean;
  congDong: boolean;
  nhanTinRieng: boolean;
  troLyAI: boolean;
  thanhToan: boolean;
}

export interface CauHinh {
  khoa: string;
  hanMucAI: HanMucAI;
  giaGoi: GiaGoi;
  trongSoGoiY: TrongSoGoiY;
  congTacTinhNang: CongTacTinhNang;
  thongBaoBaoTri: ThongBaoBaoTri;
}

export const NHAN_TINH_NANG: Record<keyof CongTacTinhNang, string> = {
  choVatTu: 'Chợ Vật Tư',
  congDong: 'Cộng đồng',
  nhanTinRieng: 'Nhắn tin riêng',
  troLyAI: 'Trợ lý AI',
  thanhToan: 'Thanh toán trong ứng dụng',
};

export const NHAN_TRONG_SO: Record<keyof TrongSoGoiY, string> = {
  anhSang: 'Ánh sáng',
  thoiGian: 'Thời gian rảnh',
  kinhNghiem: 'Kinh nghiệm',
  dienTich: 'Diện tích',
  mucDich: 'Mục đích',
  phongThuy: 'Phong thuỷ',
};
