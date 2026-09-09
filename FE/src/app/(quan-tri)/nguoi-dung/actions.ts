'use server';

import { revalidatePath } from 'next/cache';
import { goiApi, LoiApi } from '@/lib/api';

export type KetQuaThaoTac = { thanhCong: true } | { thanhCong: false; loi: string };

export async function khoaNguoiDung(id: string, lyDo: string): Promise<KetQuaThaoTac> {
  try {
    await goiApi(`/nguoi-dung/${id}/khoa`, { method: 'PATCH', body: JSON.stringify({ lyDo }) });
  } catch (e) {
    return { thanhCong: false, loi: (e as LoiApi).message ?? 'Không khoá được tài khoản.' };
  }
  revalidatePath('/nguoi-dung');
  return { thanhCong: true };
}

export async function kichHoatNguoiDung(id: string): Promise<KetQuaThaoTac> {
  try {
    await goiApi(`/nguoi-dung/${id}/kich-hoat`, { method: 'PATCH' });
  } catch (e) {
    return { thanhCong: false, loi: (e as LoiApi).message ?? 'Không kích hoạt lại được.' };
  }
  revalidatePath('/nguoi-dung');
  return { thanhCong: true };
}
