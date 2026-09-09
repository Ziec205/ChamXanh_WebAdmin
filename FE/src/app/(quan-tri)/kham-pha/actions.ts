'use server';

import { revalidatePath } from 'next/cache';
import { goiApi, LoiApi } from '@/lib/api';
import type { DuLieuKhamPha } from './kieu';

export type KetQuaLuu = { thanhCong: true } | { thanhCong: false; loi: string };

export async function taoKhamPha(du_lieu: DuLieuKhamPha): Promise<KetQuaLuu> {
  try {
    await goiApi('/kham-pha', { method: 'POST', body: JSON.stringify(du_lieu) });
  } catch (e) {
    return { thanhCong: false, loi: (e as LoiApi).message ?? 'Không tạo được nội dung.' };
  }
  revalidatePath('/kham-pha');
  return { thanhCong: true };
}

export async function capNhatKhamPha(id: string, du_lieu: DuLieuKhamPha): Promise<KetQuaLuu> {
  try {
    await goiApi(`/kham-pha/${id}`, { method: 'PATCH', body: JSON.stringify(du_lieu) });
  } catch (e) {
    return { thanhCong: false, loi: (e as LoiApi).message ?? 'Không lưu được thay đổi.' };
  }
  revalidatePath('/kham-pha');
  return { thanhCong: true };
}

export async function xoaKhamPha(id: string): Promise<KetQuaLuu> {
  try {
    await goiApi(`/kham-pha/${id}`, { method: 'DELETE' });
  } catch (e) {
    return { thanhCong: false, loi: (e as LoiApi).message ?? 'Không xoá được nội dung.' };
  }
  revalidatePath('/kham-pha');
  return { thanhCong: true };
}
