import type { Metadata } from 'next';
import Link from 'next/link';
import { goiApi } from '@/lib/api';
import { dinhDangNgayGio } from '@/lib/dinh-dang';
import { TEN_VAI, type VaiTro } from '@/lib/vai-tro';
import { DOI_TUONG_DA_BIET, type TrangNhatKy } from './kieu';

export const metadata: Metadata = { title: 'Nhật ký thao tác' };

const HANH_DONG_MAU: Record<string, string> = {
  'thêm loài cây': 'chip-tot',
  'sửa loài cây': 'chip-canh-bao',
  'sửa câu hỏi khảo sát': 'chip-canh-bao',
  'cập nhật cấu hình hệ thống': 'chip-canh-bao',
};

export default async function TrangNhatKyThaoTac({
  searchParams,
}: {
  searchParams: Promise<{ doiTuong?: string; email?: string; trang?: string }>;
}) {
  const { doiTuong, email, trang } = await searchParams;

  let du_lieu: TrangNhatKy = { muc: [], tong: 0, trang: 1, moiTrang: 50, soTrang: 0 };
  let loi: string | null = null;

  try {
    const thamSo = new URLSearchParams();
    if (doiTuong) thamSo.set('doiTuong', doiTuong);
    if (email) thamSo.set('email', email);
    if (trang) thamSo.set('trang', trang);
    du_lieu = await goiApi<TrangNhatKy>(`/nhat-ky?${thamSo.toString()}`);
  } catch (e) {
    loi = (e as Error).message;
  }

  const trangHienTai = du_lieu.trang;
  const taoDuongDanTrang = (t: number) => {
    const thamSo = new URLSearchParams();
    if (doiTuong) thamSo.set('doiTuong', doiTuong);
    if (email) thamSo.set('email', email);
    thamSo.set('trang', String(t));
    return `/nhat-ky?${thamSo.toString()}`;
  };

  return (
    <>
      <div className="dau-trang">
        <p className="nhan">Hệ thống</p>
        <h1>Nhật ký thao tác</h1>
        <p className="mo-ta-trang">
          Ai đổi trường nào, lúc nào, từ giá trị gì sang giá trị gì. Chỉ ghi lại những trường thật
          sự thay đổi, không chép cả bản ghi. Tự dọn sau một năm.
        </p>
      </div>

      {loi && (
        <div className="bao bao-loi" role="alert" style={{ marginBottom: 'var(--k4)' }}>
          <span aria-hidden="true">⚠</span>
          <span>{loi}</span>
        </div>
      )}

      <form className="thanh-loc-nhat-ky" role="search">
        <div className="truong">
          <label htmlFor="doiTuong">Đối tượng</label>
          <select id="doiTuong" name="doiTuong" defaultValue={doiTuong ?? ''}>
            <option value="">Tất cả</option>
            {DOI_TUONG_DA_BIET.map((d) => (
              <option key={d.gia_tri} value={d.gia_tri}>
                {d.nhan}
              </option>
            ))}
          </select>
        </div>
        <div className="truong">
          <label htmlFor="email">Email người thực hiện</label>
          <input id="email" name="email" type="text" defaultValue={email ?? ''} placeholder="admin@chamxanh.vn" />
        </div>
        <button type="submit" className="nut nut-phu">
          Lọc
        </button>
        {(doiTuong || email) && (
          <Link href="/nhat-ky" className="nut nut-phu">
            Xoá lọc
          </Link>
        )}
      </form>

      <p className="goi-y" style={{ margin: '0 0 var(--k3)' }}>
        {du_lieu.tong} bản ghi
      </p>

      <div className="bang-cuon">
        <table>
          <caption className="an-nhin">Nhật ký thao tác của người quản trị</caption>
          <thead>
            <tr>
              <th scope="col">Thời điểm</th>
              <th scope="col">Người thực hiện</th>
              <th scope="col">Hành động</th>
              <th scope="col">Đối tượng</th>
              <th scope="col">Thay đổi</th>
            </tr>
          </thead>
          <tbody>
            {du_lieu.muc.length === 0 && !loi && (
              <tr>
                <td colSpan={5}>
                  <div className="rong">
                    <strong>Chưa có bản ghi nào khớp</strong>
                    Thử xoá bộ lọc, hoặc chờ tới khi có thao tác sửa dữ liệu.
                  </div>
                </td>
              </tr>
            )}
            {du_lieu.muc.map((b) => (
              <tr key={b._id}>
                <td className="so">{dinhDangNgayGio(b.thoiDiem)}</td>
                <td>
                  {b.email}
                  <div className="phu-chu">{TEN_VAI[b.vaiTro as VaiTro] ?? b.vaiTro}</div>
                </td>
                <td>
                  <span className={`chip ${HANH_DONG_MAU[b.hanhDong] ?? 'chip-tot'}`}>{b.hanhDong}</span>
                </td>
                <td>
                  {b.doiTuong}
                  {b.maDoiTuong && <div className="phu-chu">{b.maDoiTuong}</div>}
                </td>
                <td>
                  {b.truocKhi || b.sauKhi ? (
                    <details className="chi-tiet-thay-doi">
                      <summary>Xem chi tiết</summary>
                      <div className="noi-dung-thay-doi">
                        <div>
                          <p className="nhan">Trước</p>
                          <pre>{JSON.stringify(b.truocKhi, null, 2)}</pre>
                        </div>
                        <div>
                          <p className="nhan">Sau</p>
                          <pre>{JSON.stringify(b.sauKhi, null, 2)}</pre>
                        </div>
                      </div>
                    </details>
                  ) : (
                    <span className="phu-chu">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {du_lieu.soTrang > 1 && (
        <nav className="phan-trang" aria-label="Điều hướng trang">
          {trangHienTai > 1 && (
            <Link href={taoDuongDanTrang(trangHienTai - 1)} className="nut nut-phu">
              ← Trước
            </Link>
          )}
          <span className="goi-y">
            Trang {trangHienTai} / {du_lieu.soTrang}
          </span>
          {trangHienTai < du_lieu.soTrang && (
            <Link href={taoDuongDanTrang(trangHienTai + 1)} className="nut nut-phu">
              Sau →
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
