import type { Metadata } from 'next';
import Link from 'next/link';
import FormKhamPha from '../form-kham-pha';

export const metadata: Metadata = { title: 'Thêm nội dung khám phá' };

export default function TrangThemKhamPha() {
  return (
    <>
      <div className="dau-trang">
        <p className="nhan">
          <Link href="/kham-pha">Khám phá</Link> / Thêm mới
        </p>
        <h1>Thêm nội dung khám phá</h1>
      </div>
      <FormKhamPha khamPhaBanDau={null} />
    </>
  );
}
