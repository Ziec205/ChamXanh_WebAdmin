'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { goiApi, LoiApi } from '@/lib/api';
import type { DuLieuCay } from './kieu';

export type KetQuaLuu = { thanhCong: true } | { thanhCong: false; loi: string };

/** Bỏ những trường rỗng/null trước khi gửi — để BE tự áp giá trị mặc định thay vì ghi đè bằng rỗng. */
function donDep(du_lieu: DuLieuCay): Record<string, unknown> {
  const {
    menhPhongThuy,
    chuKyBonPhan,
    chuKyThayDat,
    khoangCachTrongCm,
    ngayThuHoach,
    ...con_lai
  } = du_lieu;

  const ket_qua: Record<string, unknown> = { ...con_lai };
  if (menhPhongThuy) ket_qua.menhPhongThuy = menhPhongThuy;
  if (chuKyBonPhan !== null) ket_qua.chuKyBonPhan = chuKyBonPhan;
  if (chuKyThayDat !== null) ket_qua.chuKyThayDat = chuKyThayDat;
  if (khoangCachTrongCm !== null) ket_qua.khoangCachTrongCm = khoangCachTrongCm;
  if (ngayThuHoach !== null) ket_qua.ngayThuHoach = ngayThuHoach;

  return ket_qua;
}

export async function taoCay(du_lieu: DuLieuCay): Promise<KetQuaLuu> {
  try {
    await goiApi('/cay-trong', {
      method: 'POST',
      body: JSON.stringify(donDep(du_lieu)),
    });
  } catch (e) {
    const loi = e as LoiApi;
    return { thanhCong: false, loi: loi.message ?? 'Không tạo được loài cây.' };
  }

  revalidatePath('/cay-trong');
  redirect(`/cay-trong/${du_lieu.ma}?vua-tao=1`);
}

export async function capNhatCay(ma: string, du_lieu: DuLieuCay): Promise<KetQuaLuu> {
  try {
    // Trường "ma" bị BE bỏ qua khi cập nhật, nhưng vẫn xoá ở đây cho rõ ràng.
    const { ma: _bo, ...phanConLai } = donDep(du_lieu) as Record<string, unknown> & { ma?: string };
    void _bo;
    await goiApi(`/cay-trong/${ma}`, {
      method: 'PATCH',
      body: JSON.stringify(phanConLai),
    });
  } catch (e) {
    const loi = e as LoiApi;
    return { thanhCong: false, loi: loi.message ?? 'Không lưu được thay đổi.' };
  }

  revalidatePath('/cay-trong');
  revalidatePath(`/cay-trong/${ma}`);
  return { thanhCong: true };
}
