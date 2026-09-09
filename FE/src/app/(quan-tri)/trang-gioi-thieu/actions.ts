'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { goiApi, LoiApi } from '@/lib/api';
import type { DuLieuBaiViet } from './kieu';

export type KetQuaLuu = { thanhCong: true } | { thanhCong: false; loi: string };

export async function taoBaiViet(du_lieu: DuLieuBaiViet): Promise<KetQuaLuu> {
  try {
    await goiApi('/trang-gioi-thieu', { method: 'POST', body: JSON.stringify(du_lieu) });
  } catch (e) {
    return { thanhCong: false, loi: (e as LoiApi).message ?? 'Không tạo được bài viết.' };
  }
  revalidatePath('/trang-gioi-thieu');
  redirect(`/trang-gioi-thieu/${du_lieu.duongDan}`);
}

export async function capNhatBaiViet(duongDan: string, du_lieu: DuLieuBaiViet): Promise<KetQuaLuu> {
  try {
    const { duongDan: _bo, ...con_lai } = du_lieu;
    void _bo;
    await goiApi(`/trang-gioi-thieu/${duongDan}`, { method: 'PATCH', body: JSON.stringify(con_lai) });
  } catch (e) {
    return { thanhCong: false, loi: (e as LoiApi).message ?? 'Không lưu được thay đổi.' };
  }
  revalidatePath('/trang-gioi-thieu');
  revalidatePath(`/trang-gioi-thieu/${duongDan}`);
  return { thanhCong: true };
}

export async function xoaBaiViet(duongDan: string): Promise<KetQuaLuu> {
  try {
    await goiApi(`/trang-gioi-thieu/${duongDan}`, { method: 'DELETE' });
  } catch (e) {
    return { thanhCong: false, loi: (e as LoiApi).message ?? 'Không xoá được bài viết.' };
  }
  revalidatePath('/trang-gioi-thieu');
  return { thanhCong: true };
}
