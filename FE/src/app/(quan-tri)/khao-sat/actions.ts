'use server';

import { revalidatePath } from 'next/cache';
import { goiApi, LoiApi } from '@/lib/api';
import type { DapAn } from './kieu';

export type KetQuaLuu = { thanhCong: true } | { thanhCong: false; loi: string };

export interface SuaCauHoiInput {
  thuTu: number;
  cauHoi: string;
  moTa: string;
  nhieuLuaChon: boolean;
  batBuoc: boolean;
  dapAn: DapAn[];
  dangHienThi: boolean;
}

export async function suaCauHoi(khoa: string, du_lieu: SuaCauHoiInput): Promise<KetQuaLuu> {
  try {
    await goiApi(`/khao-sat/cau-hoi/${khoa}`, {
      method: 'PATCH',
      body: JSON.stringify(du_lieu),
    });
  } catch (e) {
    const loi = e as LoiApi;
    return { thanhCong: false, loi: loi.message ?? 'Không lưu được câu hỏi.' };
  }

  revalidatePath('/khao-sat');
  return { thanhCong: true };
}

export type KetQuaNapMacDinh =
  | { thanhCong: true; themMoi: number; boQua: number }
  | { thanhCong: false; loi: string };

export async function napBoCauHoiMacDinh(): Promise<KetQuaNapMacDinh> {
  try {
    const ketQua = await goiApi<{ themMoi: number; boQua: number }>('/khao-sat/cau-hoi/nap-mac-dinh', {
      method: 'POST',
    });
    revalidatePath('/khao-sat');
    return { thanhCong: true, themMoi: ketQua.themMoi, boQua: ketQua.boQua };
  } catch (e) {
    const loi = e as LoiApi;
    return { thanhCong: false, loi: loi.message ?? 'Không nạp được bộ câu hỏi mặc định.' };
  }
}
