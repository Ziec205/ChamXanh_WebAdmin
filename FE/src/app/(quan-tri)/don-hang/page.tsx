import type { Metadata } from 'next';
import Link from 'next/link';
import { goiApi } from '@/lib/api';
import { dinhDangNgayGio, dinhDangTien } from '@/lib/dinh-dang';
import { TRANG_THAI_DON_HANG, NHAN_TRANG_THAI_DON } from '@/lib/hang-so';
import NutChuyenTrangThai from './nut-chuyen-trang-thai';
import type { DonHangTuApi } from './kieu';

export const metadata: Metadata = { title: 'Đơn hàng' };

const MAU_TRANG_THAI: Record<DonHangTuApi['trangThai'], string> = {
  'cho-xac-nhan': 'chip-canh-bao',
  'dang-giao': 'chip-canh-bao',
  'hoan-thanh': 'chip-tot',
  'da-huy': 'chip-loi',
};

export default async function TrangDonHang({
  searchParams,
}: {
  searchParams: Promise<{ trangThai?: string }>;
}) {
  const { trangThai } = await searchParams;

  let danhSach: DonHangTuApi[] = [];
  let loi: string | null = null;

  try {
    danhSach = await goiApi<DonHangTuApi[]>(`/don-hang${trangThai ? `?trangThai=${trangThai}` : ''}`);
  } catch (e) {
    loi = (e as Error).message;
  }

  return (
    <>
      <div className="dau-trang">
        <p className="nhan">Chợ Vật Tư</p>
        <h1>Đơn hàng</h1>
        <p className="mo-ta-trang">
          Chưa có luồng đặt đơn thật từ app (GĐ 7) — trang này quản lý trạng thái đơn khi luồng đó
          đi vào hoạt động. Chuyển trạng thái không được nhảy cóc hoặc quay lại sau khi đã hoàn
          thành/huỷ.
        </p>
      </div>

      {loi && (
        <div className="bao bao-loi" role="alert" style={{ marginBottom: 'var(--k4)' }}>
          <span aria-hidden="true">⚠</span>
          <span>{loi}</span>
        </div>
      )}

      <div className="thanh-loc-nhat-ky" role="search" style={{ marginBottom: 'var(--k4)' }}>
        <Link href="/don-hang" className={`nut nut-phu ${!trangThai ? 'nut-chinh' : ''}`}>
          Tất cả
        </Link>
        {TRANG_THAI_DON_HANG.map((t) => (
          <Link key={t} href={`/don-hang?trangThai=${t}`} className={`nut nut-phu ${trangThai === t ? 'nut-chinh' : ''}`}>
            {NHAN_TRANG_THAI_DON[t]}
          </Link>
        ))}
      </div>

      <div className="bang-cuon">
        <table>
          <caption className="an-nhin">Danh sách đơn hàng Chợ Vật Tư</caption>
          <thead>
            <tr>
              <th scope="col">Thời điểm</th>
              <th scope="col">Khách hàng</th>
              <th scope="col">Số món</th>
              <th scope="col">Tổng tiền</th>
              <th scope="col">Thanh toán</th>
              <th scope="col">Trạng thái</th>
              <th scope="col">
                <span className="an-nhin">Thao tác</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {danhSach.length === 0 && !loi && (
              <tr>
                <td colSpan={7}>
                  <div className="rong">
                    <strong>Không có đơn hàng nào khớp bộ lọc</strong>
                    Đơn sẽ xuất hiện ở đây khi luồng đặt hàng thật (GĐ 7) đi vào hoạt động.
                  </div>
                </td>
              </tr>
            )}
            {danhSach.map((d) => (
              <tr key={d._id}>
                <td className="so">{dinhDangNgayGio(d.createdAt)}</td>
                <td>{d.emailKhachHang || <span className="phu-chu">—</span>}</td>
                <td className="so">{d.danhSachHang.reduce((t, h) => t + h.soLuong, 0)}</td>
                <td className="so">{dinhDangTien(d.tongTien)}</td>
                <td>{d.phuongThucThanhToan.toUpperCase()}</td>
                <td>
                  <span className={`chip ${MAU_TRANG_THAI[d.trangThai]}`}>{NHAN_TRANG_THAI_DON[d.trangThai]}</span>
                </td>
                <td>
                  <NutChuyenTrangThai id={d._id} trangThai={d.trangThai} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
