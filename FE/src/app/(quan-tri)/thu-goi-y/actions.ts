'use server';

import { goiApi, LoiApi } from '@/lib/api';
import type { CongDung, DienTich, Huong, KinhNghiem, Menh, Mien, NoiDat, ThoiGianRanh } from '@/lib/hang-so';

export interface CauTraLoiKhaoSat {
  noiDat: NoiDat;
  huong: Huong;
  dienTich: DienTich;
  kinhNghiem: KinhNghiem;
  thoiGianRanh: ThoiGianRanh;
  coThuNuoi: boolean;
  mien: Mien;
  mucDich: CongDung[];
  menh: Menh | '';
  soLuong: number;
}

export interface KetQuaChamDiem {
  ma: string;
  tenVi: string;
  diem: number;
  lyDo: string[];
  giaiThich: string;
}

export interface CayBiLoai {
  ma: string;
  tenVi: string;
  lyDoLoai: string;
}

export interface TrongSoGoiY {
  anhSang: number;
  thoiGian: number;
  kinhNghiem: number;
  dienTich: number;
  mucDich: number;
  phongThuy: number;
}

export interface KetQuaGoiYDayDu {
  goiY: KetQuaChamDiem[];
  biLoai: CayBiLoai[];
  anhSangCoSan: string;
  tongSoLoaiXet: number;
  trongSoDaDung: TrongSoGoiY;
}

export type KetQuaHanhDong =
  | { thanhCong: true; duLieu: KetQuaGoiYDayDu }
  | { thanhCong: false; loi: string };

/**
 * Server Action — chạy trên server nên dùng lại được goiApi (đọc token từ
 * cookie httpOnly) y hệt các trang chỉ đọc, không cần thêm một Route Handler
 * riêng chỉ để proxy một lời gọi POST.
 */
export async function xinGoiY(traLoi: CauTraLoiKhaoSat): Promise<KetQuaHanhDong> {
  const than: Record<string, unknown> = {
    noiDat: traLoi.noiDat,
    huong: traLoi.huong,
    dienTich: traLoi.dienTich,
    kinhNghiem: traLoi.kinhNghiem,
    thoiGianRanh: traLoi.thoiGianRanh,
    coThuNuoi: traLoi.coThuNuoi,
    mien: traLoi.mien,
    soLuong: traLoi.soLuong,
  };
  if (traLoi.mucDich.length > 0) than.mucDich = traLoi.mucDich;
  if (traLoi.menh) than.menh = traLoi.menh;

  try {
    const duLieu = await goiApi<KetQuaGoiYDayDu>('/goi-y', {
      method: 'POST',
      body: JSON.stringify(than),
    });
    return { thanhCong: true, duLieu };
  } catch (e) {
    const loi = e as LoiApi;
    return { thanhCong: false, loi: loi.message ?? 'Không gọi được thuật toán gợi ý.' };
  }
}
