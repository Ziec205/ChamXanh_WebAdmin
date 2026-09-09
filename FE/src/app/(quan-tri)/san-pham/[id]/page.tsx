import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { goiApi, LoiApi } from '@/lib/api';
import FormSanPham from '../form-san-pham';
import type { SanPhamTuApi } from '../kieu';

export const metadata: Metadata = { title: 'Sửa sản phẩm' };

export default async function TrangSuaSanPham({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let sanPham: SanPhamTuApi;
  try {
    sanPham = await goiApi<SanPhamTuApi>(`/san-pham/${id}`);
  } catch (e) {
    if (e instanceof LoiApi && e.maLoi === 404) notFound();
    throw e;
  }

  return (
    <>
      <div className="dau-trang">
        <p className="nhan">
          <Link href="/san-pham">Sản phẩm</Link> / {sanPham.ten}
        </p>
        <h1>Sửa sản phẩm</h1>
      </div>
      <FormSanPham sanPhamBanDau={sanPham} />
    </>
  );
}
