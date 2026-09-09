import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { goiApi, LoiApi } from '@/lib/api';
import FormCay from '../form-cay';
import type { DuLieuCay, MaCayLuaChon } from '../kieu';

/** Document trả về từ API có thêm _id, createdAt, updatedAt và menhPhongThuy dạng null. */
type CayTuApi = Omit<DuLieuCay, 'menhPhongThuy'> & { _id: string; menhPhongThuy: string | null };

function chuyenSangDuLieuForm(cay: CayTuApi): DuLieuCay {
  return { ...cay, menhPhongThuy: (cay.menhPhongThuy ?? '') as DuLieuCay['menhPhongThuy'] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ma: string }>;
}): Promise<Metadata> {
  const { ma } = await params;
  return { title: `Sửa · ${ma}` };
}

export default async function TrangSuaCay({
  params,
  searchParams,
}: {
  params: Promise<{ ma: string }>;
  searchParams: Promise<{ 'vua-tao'?: string }>;
}) {
  const { ma } = await params;
  const { 'vua-tao': vuaTao } = await searchParams;

  let cay: CayTuApi;
  try {
    cay = await goiApi<CayTuApi>(`/cay-trong/${ma}`);
  } catch (e) {
    if (e instanceof LoiApi && e.maLoi === 404) notFound();
    throw e;
  }

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
          <Link href="/cay-trong">Cây trồng</Link> / {cay.tenVi}
        </p>
        <h1>Sửa loài cây</h1>
      </div>

      {vuaTao && (
        <div className="bao bao-thanh-cong" style={{ marginBottom: 'var(--k4)' }}>
          <span aria-hidden="true">✓</span>
          <span>Đã tạo loài cây mới. Xem lại và bổ sung thêm thông tin nếu cần.</span>
        </div>
      )}

      <FormCay cayBanDau={chuyenSangDuLieuForm(cay)} danhSachCay={danhSachCay} />
    </>
  );
}
