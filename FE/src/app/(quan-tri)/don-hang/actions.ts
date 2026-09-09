'use server';

import { revalidatePath } from 'next/cache';
import { goiApi, LoiApi } from '@/lib/api';
import type { TrangThaiDonHang } from '@/lib/hang-so';

export type KetQuaThaoTac = { thanhCong: true } | { thanhCong: false; loi: string };

export async function capNhatTrangThaiDon(id: string, trangThai: TrangThaiDonHang): Promise<KetQuaThaoTac> {
  try {
    await goiApi(`/don-hang/${id}/trang-thai`, { method: 'PATCH', body: JSON.stringify({ trangThai }) });
  } catch (e) {
    return { thanhCong: false, loi: (e as LoiApi).message ?? 'Không cập nhật được trạng thái.' };
  }
  revalidatePath('/don-hang');
  return { thanhCong: true };
}
