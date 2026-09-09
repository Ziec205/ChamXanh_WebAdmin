'use server';

import { revalidatePath } from 'next/cache';
import { goiApi, LoiApi } from '@/lib/api';
import type { TrangThaiBaoCao } from '@/lib/hang-so';

export type KetQuaThaoTac = { thanhCong: true } | { thanhCong: false; loi: string };

export async function xuLyBaoCao(
  id: string,
  trangThai: Extract<TrangThaiBaoCao, 'da-xu-ly' | 'da-bo-qua'>,
  ghiChuXuLy: string,
): Promise<KetQuaThaoTac> {
  try {
    await goiApi(`/kiem-duyet/${id}`, { method: 'PATCH', body: JSON.stringify({ trangThai, ghiChuXuLy }) });
  } catch (e) {
    return { thanhCong: false, loi: (e as LoiApi).message ?? 'Không xử lý được báo cáo.' };
  }
  revalidatePath('/kiem-duyet');
  return { thanhCong: true };
}
