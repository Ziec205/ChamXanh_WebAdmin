import type { Metadata } from 'next';
import Link from 'next/link';
import { goiApi } from '@/lib/api';
import { dinhDangNgayGio } from '@/lib/dinh-dang';
import { TRANG_THAI_BAO_CAO, NHAN_TRANG_THAI_BAO_CAO } from '@/lib/hang-so';
import NutXuLy from './nut-xu-ly';
import type { BaoCaoTuApi } from './kieu';

export const metadata: Metadata = { title: 'Kiểm duyệt' };

const NHAN_LOAI: Record<BaoCaoTuApi['loaiDoiTuong'], string> = {
  'bai-viet': 'Bài viết',
  'binh-luan': 'Bình luận',
  'nguoi-dung': 'Người dùng',
};

export default async function TrangKiemDuyet({
  searchParams,
}: {
  searchParams: Promise<{ trangThai?: string }>;
}) {
  const { trangThai } = await searchParams;

  let danhSach: BaoCaoTuApi[] = [];
  let loi: string | null = null;

  try {
    danhSach = await goiApi<BaoCaoTuApi[]>(`/kiem-duyet${trangThai ? `?trangThai=${trangThai}` : ''}`);
  } catch (e) {
    loi = (e as Error).message;
  }

  return (
    <>
      <div className="dau-trang">
        <p className="nhan">Người dùng</p>
        <h1>Kiểm duyệt</h1>
        <p className="mo-ta-trang">
          Hàng đợi báo cáo vi phạm từ cộng đồng (bài viết, bình luận, người dùng). Bắt buộc để được
          duyệt store — Apple 1.2.
        </p>
      </div>

      {loi && (
        <div className="bao bao-loi" role="alert" style={{ marginBottom: 'var(--k4)' }}>
          <span aria-hidden="true">⚠</span>
          <span>{loi}</span>
        </div>
      )}

      <div className="thanh-loc-nhat-ky" role="search" style={{ marginBottom: 'var(--k4)' }}>
        <Link href="/kiem-duyet" className={`nut nut-phu ${!trangThai ? 'nut-chinh' : ''}`}>
          Tất cả
        </Link>
        {TRANG_THAI_BAO_CAO.map((t) => (
          <Link key={t} href={`/kiem-duyet?trangThai=${t}`} className={`nut nut-phu ${trangThai === t ? 'nut-chinh' : ''}`}>
            {NHAN_TRANG_THAI_BAO_CAO[t]}
          </Link>
        ))}
      </div>

      <div className="bang-cuon">
        <table>
          <caption className="an-nhin">Hàng đợi báo cáo kiểm duyệt</caption>
          <thead>
            <tr>
              <th scope="col">Thời điểm</th>
              <th scope="col">Loại</th>
              <th scope="col">Người báo cáo</th>
              <th scope="col">Lý do</th>
              <th scope="col">Trạng thái</th>
              <th scope="col">
                <span className="an-nhin">Thao tác</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {danhSach.length === 0 && !loi && (
              <tr>
                <td colSpan={6}>
                  <div className="rong">
                    <strong>Không có báo cáo nào khớp bộ lọc</strong>
                    Hàng đợi trống khi cộng đồng (GĐ 8) chưa dựng xong, hoặc đã xử lý hết.
                  </div>
                </td>
              </tr>
            )}
            {danhSach.map((b) => (
              <tr key={b._id}>
                <td className="so">{dinhDangNgayGio(b.createdAt)}</td>
                <td>
                  {NHAN_LOAI[b.loaiDoiTuong]}
                  <div className="phu-chu">{b.maDoiTuong}</div>
                </td>
                <td>{b.emailNguoiBaoCao || <span className="phu-chu">—</span>}</td>
                <td>
                  {b.lyDo}
                  {b.ghiChuXuLy && <div className="phu-chu">Ghi chú: {b.ghiChuXuLy}</div>}
                </td>
                <td>
                  <span className={`chip ${b.trangThai === 'cho-xu-ly' ? 'chip-canh-bao' : 'chip-tot'}`}>
                    {NHAN_TRANG_THAI_BAO_CAO[b.trangThai]}
                  </span>
                </td>
                <td>{b.trangThai === 'cho-xu-ly' ? <NutXuLy id={b._id} /> : <span className="phu-chu">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
