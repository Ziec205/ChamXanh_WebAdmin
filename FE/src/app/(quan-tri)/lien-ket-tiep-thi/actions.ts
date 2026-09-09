'use server';

import { revalidatePath } from 'next/cache';
import { goiApi, LoiApi } from '@/lib/api';
import type { DuLieuLienKet } from './kieu';

export type KetQuaLuu = { thanhCong: true } | { thanhCong: false; loi: string };

export async function taoLienKet(du_lieu: DuLieuLienKet): Promise<KetQuaLuu> {
  try {
    await goiApi('/lien-ket-tiep-thi', { method: 'POST', body: JSON.stringify(du_lieu) });
  } catch (e) {
    return { thanhCong: false, loi: (e as LoiApi).message ?? 'Không tạo được liên kết.' };
  }
  revalidatePath('/lien-ket-tiep-thi');
  return { thanhCong: true };
}

export async function capNhatLienKet(id: string, du_lieu: DuLieuLienKet): Promise<KetQuaLuu> {
  try {
    await goiApi(`/lien-ket-tiep-thi/${id}`, { method: 'PATCH', body: JSON.stringify(du_lieu) });
  } catch (e) {
    return { thanhCong: false, loi: (e as LoiApi).message ?? 'Không lưu được thay đổi.' };
  }
  revalidatePath('/lien-ket-tiep-thi');
  return { thanhCong: true };
}

export async function xoaLienKet(id: string): Promise<KetQuaLuu> {
  try {
    await goiApi(`/lien-ket-tiep-thi/${id}`, { method: 'DELETE' });
  } catch (e) {
    return { thanhCong: false, loi: (e as LoiApi).message ?? 'Không xoá được liên kết.' };
  }
  revalidatePath('/lien-ket-tiep-thi');
  return { thanhCong: true };
}
