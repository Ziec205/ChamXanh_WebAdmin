import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { goiApi, LoiApi } from '@/lib/api';
import FormKhamPha from '../form-kham-pha';
import type { KhamPhaTuApi } from '../kieu';

export const metadata: Metadata = { title: 'Sửa nội dung khám phá' };

export default async function TrangSuaKhamPha({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let muc: KhamPhaTuApi;
  try {
    muc = await goiApi<KhamPhaTuApi>(`/kham-pha/${id}`);
  } catch (e) {
    if (e instanceof LoiApi && e.maLoi === 404) notFound();
    throw e;
  }

  return (
    <>
      <div className="dau-trang">
        <p className="nhan">
          <Link href="/kham-pha">Khám phá</Link> / {muc.tieuDe}
        </p>
        <h1>Sửa nội dung khám phá</h1>
      </div>
      <FormKhamPha khamPhaBanDau={muc} />
    </>
  );
}
