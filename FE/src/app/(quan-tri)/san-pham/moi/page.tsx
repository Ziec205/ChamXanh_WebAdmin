import type { Metadata } from 'next';
import Link from 'next/link';
import FormSanPham from '../form-san-pham';

export const metadata: Metadata = { title: 'Thêm sản phẩm' };

export default function TrangThemSanPham() {
  return (
    <>
      <div className="dau-trang">
        <p className="nhan">
          <Link href="/san-pham">Sản phẩm</Link> / Thêm mới
        </p>
        <h1>Thêm sản phẩm</h1>
      </div>
      <FormSanPham sanPhamBanDau={null} />
    </>
  );
}
