'use server';

import { revalidatePath } from 'next/cache';
import { goiApi, LoiApi } from '@/lib/api';
import type { DuLieuSanPham } from './kieu';

export type KetQuaLuu = { thanhCong: true } | { thanhCong: false; loi: string };

export async function taoSanPham(du_lieu: DuLieuSanPham): Promise<KetQuaLuu> {
  try {
    await goiApi('/san-pham', { method: 'POST', body: JSON.stringify(du_lieu) });
  } catch (e) {
    return { thanhCong: false, loi: (e as LoiApi).message ?? 'Không tạo được sản phẩm.' };
  }
  revalidatePath('/san-pham');
  return { thanhCong: true };
}

export async function capNhatSanPham(id: string, du_lieu: DuLieuSanPham): Promise<KetQuaLuu> {
  try {
    await goiApi(`/san-pham/${id}`, { method: 'PATCH', body: JSON.stringify(du_lieu) });
  } catch (e) {
    return { thanhCong: false, loi: (e as LoiApi).message ?? 'Không lưu được thay đổi.' };
  }
  revalidatePath('/san-pham');
  return { thanhCong: true };
}

export async function xoaSanPham(id: string): Promise<KetQuaLuu> {
  try {
    await goiApi(`/san-pham/${id}`, { method: 'DELETE' });
  } catch (e) {
    return { thanhCong: false, loi: (e as LoiApi).message ?? 'Không xoá được sản phẩm.' };
  }
  revalidatePath('/san-pham');
  return { thanhCong: true };
}
