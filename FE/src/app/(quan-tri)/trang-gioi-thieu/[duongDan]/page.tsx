import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { goiApi, LoiApi } from '@/lib/api';
import FormBaiViet from '../form-bai-viet';
import type { BaiVietTuApi } from '../kieu';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ duongDan: string }>;
}): Promise<Metadata> {
  const { duongDan } = await params;
  return { title: `Sửa · ${duongDan}` };
}

export default async function TrangSuaBaiViet({ params }: { params: Promise<{ duongDan: string }> }) {
  const { duongDan } = await params;

  let baiViet: BaiVietTuApi;
  try {
    baiViet = await goiApi<BaiVietTuApi>(`/trang-gioi-thieu/${duongDan}`);
  } catch (e) {
    if (e instanceof LoiApi && e.maLoi === 404) notFound();
    throw e;
  }

  return (
    <>
      <div className="dau-trang">
        <p className="nhan">
          <Link href="/trang-gioi-thieu">Trang giới thiệu</Link> / {baiViet.tieuDe}
        </p>
        <h1>Sửa bài viết</h1>
      </div>
      <FormBaiViet baiVietBanDau={baiViet} />
    </>
  );
}
