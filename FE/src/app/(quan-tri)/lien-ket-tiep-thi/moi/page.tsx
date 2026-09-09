import type { Metadata } from 'next';
import Link from 'next/link';
import FormLienKet from '../form-lien-ket';

export const metadata: Metadata = { title: 'Thêm liên kết tiếp thị' };

export default function TrangThemLienKet() {
  return (
    <>
      <div className="dau-trang">
        <p className="nhan">
          <Link href="/lien-ket-tiep-thi">Liên kết tiếp thị</Link> / Thêm mới
        </p>
        <h1>Thêm liên kết tiếp thị</h1>
      </div>
      <FormLienKet lienKetBanDau={null} />
    </>
  );
}
