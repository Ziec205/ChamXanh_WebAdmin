import type { Metadata } from 'next';
import { goiApi } from '@/lib/api';
import { dinhDangNgay } from '@/lib/dinh-dang';
import NutKhoa from './nut-khoa';
import type { TrangNguoiDung } from './kieu';

export const metadata: Metadata = { title: 'Người dùng app' };

export default async function TrangNguoiDung({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  let du_lieu: TrangNguoiDung = { muc: [], tong: 0, trang: 1, moiTrang: 50, soTrang: 0 };
  let loi: string | null = null;

  try {
    du_lieu = await goiApi<TrangNguoiDung>(
      `/nguoi-dung${email ? `?email=${encodeURIComponent(email)}` : ''}`,
    );
  } catch (e) {
    loi = (e as Error).message;
  }

  return (
    <>
      <div className="dau-trang">
        <p className="nhan">Người dùng</p>
        <h1>Người dùng app</h1>
        <p className="mo-ta-trang">
          Tra cứu và khoá/kích hoạt tài khoản người dùng ứng dụng di động. Tài khoản tự đăng ký
          trong app — Web Admin không tạo tài khoản người dùng mới.
        </p>
      </div>

      {loi && (
        <div className="bao bao-loi" role="alert" style={{ marginBottom: 'var(--k4)' }}>
          <span aria-hidden="true">⚠</span>
          <span>{loi}</span>
        </div>
      )}

      <form className="thanh-tim" role="search">
        <label htmlFor="email" className="an-nhin">
          Tìm theo email
        </label>
        <input id="email" name="email" type="search" placeholder="Tìm theo email…" defaultValue={email ?? ''} />
        <button type="submit" className="nut nut-phu">
          Tìm
        </button>
      </form>

      <p className="goi-y" style={{ margin: 'var(--k3) 0' }}>
        {du_lieu.tong} người dùng
      </p>

      <div className="bang-cuon">
        <table>
          <caption className="an-nhin">Danh sách người dùng app</caption>
          <thead>
            <tr>
              <th scope="col">Email</th>
              <th scope="col">Họ tên</th>
              <th scope="col">Tham gia</th>
              <th scope="col">Trạng thái</th>
              <th scope="col">
                <span className="an-nhin">Thao tác</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {du_lieu.muc.length === 0 && !loi && (
              <tr>
                <td colSpan={5}>
                  <div className="rong">
                    <strong>{email ? 'Không tìm thấy người dùng khớp' : 'Chưa có người dùng nào'}</strong>
                    {email ? (
                      <>Thử email khác, hoặc bỏ trống ô tìm để xem toàn bộ.</>
                    ) : (
                      <>Người dùng sẽ xuất hiện ở đây sau khi tự đăng ký trong app (GĐ 5).</>
                    )}
                  </div>
                </td>
              </tr>
            )}
            {du_lieu.muc.map((n) => (
              <tr key={n._id}>
                <td>{n.email}</td>
                <td>{n.hoTen || <span className="phu-chu">—</span>}</td>
                <td className="so">{dinhDangNgay(n.createdAt)}</td>
                <td>
                  <span className={`trang-thai ${n.dangHoatDong ? 'bat' : 'tat'}`}>
                    {n.dangHoatDong ? 'Hoạt động' : 'Đã khoá'}
                  </span>
                  {!n.dangHoatDong && n.lyDoKhoa && <div className="phu-chu">{n.lyDoKhoa}</div>}
                </td>
                <td>
                  <NutKhoa id={n._id} dangHoatDong={n.dangHoatDong} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
