import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { goiApi, LoiApi } from '@/lib/api';
import FormLienKet from '../form-lien-ket';
import type { LienKetTuApi } from '../kieu';

export const metadata: Metadata = { title: 'Sửa liên kết tiếp thị' };

export default async function TrangSuaLienKet({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let lienKet: LienKetTuApi;
  try {
    lienKet = await goiApi<LienKetTuApi>(`/lien-ket-tiep-thi/${id}`);
  } catch (e) {
    if (e instanceof LoiApi && e.maLoi === 404) notFound();
    throw e;
  }

  return (
    <>
      <div className="dau-trang">
        <p className="nhan">
          <Link href="/lien-ket-tiep-thi">Liên kết tiếp thị</Link> / {lienKet.tieuDe}
        </p>
        <h1>Sửa liên kết tiếp thị</h1>
      </div>
      <FormLienKet lienKetBanDau={lienKet} />
    </>
  );
}
