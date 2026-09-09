import type { Metadata } from 'next';
import Link from 'next/link';
import { goiApi } from '@/lib/api';
import FormCay from '../form-cay';
import type { MaCayLuaChon } from '../kieu';

export const metadata: Metadata = { title: 'Thêm loài cây' };

export default async function TrangThemCay() {
  let danhSachCay: MaCayLuaChon[] = [];
  try {
    const res = await goiApi<{ muc: MaCayLuaChon[] }>('/cay-trong?moiTrang=200');
    danhSachCay = res.muc;
  } catch {
    // Không chặn form nếu chỉ mỗi việc lấy danh sách trồng xen thất bại.
  }

  return (
    <>
      <div className="dau-trang">
        <p className="nhan">
          <Link href="/cay-trong">Cây trồng</Link> / Thêm mới
        </p>
        <h1>Thêm loài cây</h1>
      </div>
      <FormCay cayBanDau={null} danhSachCay={danhSachCay} />
    </>
  );
}
