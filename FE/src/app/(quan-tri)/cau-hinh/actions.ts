'use server';

import { revalidatePath } from 'next/cache';
import { goiApi, LoiApi } from '@/lib/api';
import type { CauHinh } from './kieu';

export type KetQuaLuu = { thanhCong: true } | { thanhCong: false; loi: string };

export async function capNhatCauHinh(
  thayDoi: Partial<Pick<CauHinh, 'hanMucAI' | 'giaGoi' | 'trongSoGoiY' | 'congTacTinhNang' | 'thongBaoBaoTri'>>,
): Promise<KetQuaLuu> {
  try {
    await goiApi('/cau-hinh', {
      method: 'PATCH',
      body: JSON.stringify(thayDoi),
    });
  } catch (e) {
    const loi = e as LoiApi;
    return { thanhCong: false, loi: loi.message ?? 'Không lưu được cấu hình.' };
  }

  revalidatePath('/cau-hinh');
  return { thanhCong: true };
}
