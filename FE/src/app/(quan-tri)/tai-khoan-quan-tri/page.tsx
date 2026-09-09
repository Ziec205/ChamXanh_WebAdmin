import type { Metadata } from 'next';
import { goiApi } from '@/lib/api';
import { TEN_VAI, MO_TA_VAI, type VaiTro } from '@/lib/vai-tro';

export const metadata: Metadata = { title: 'Tài khoản quản trị' };

interface TaiKhoan {
  _id: string;
  email: string;
  hoTen: string;
  vaiTro: VaiTro;
  dangHoatDong: boolean;
  lanDangNhapCuoi: string | null;
  createdAt: string;
}

function dinhDangNgay(gia_tri: string | null): string {
  if (!gia_tri) return 'Chưa đăng nhập';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(gia_tri));
}

export default async function TrangTaiKhoanQuanTri() {
  let danhSach: TaiKhoan[] = [];
  let loi: string | null = null;

  try {
    danhSach = await goiApi<TaiKhoan[]>('/admin-users');
  } catch (e) {
    loi = (e as Error).message;
  }

  return (
    <>
      <div className="dau-trang">
        <div>
          <p className="nhan">Hệ thống</p>
          <h1>Tài khoản quản trị</h1>
          <p className="mo-ta-trang">
            Chỉ vai Quản trị thấy được trang này. Tài khoản quản trị tách hoàn toàn khỏi tài khoản
            người dùng ứng dụng.
          </p>
        </div>
      </div>

      {loi && (
        <div className="bao bao-loi" role="alert" style={{ marginBottom: 'var(--k4)' }}>
          <span aria-hidden="true">⚠</span>
          <span>{loi}</span>
        </div>
      )}

      <div className="luoi-vai">
        {(Object.keys(TEN_VAI) as VaiTro[]).map((v) => (
          <div key={v} className="the-vai">
            <span className={`vai vai-${v}`}>{TEN_VAI[v]}</span>
            <p className="mo-ta-vai">{MO_TA_VAI[v]}</p>
          </div>
        ))}
      </div>

      <div className="bang-cuon" style={{ marginTop: 'var(--k5)' }}>
        <table>
          <caption className="an-nhin">Danh sách tài khoản quản trị</caption>
          <thead>
            <tr>
              <th scope="col">Họ tên</th>
              <th scope="col">Email</th>
              <th scope="col">Vai trò</th>
              <th scope="col">Trạng thái</th>
              <th scope="col">Đăng nhập gần nhất</th>
            </tr>
          </thead>
          <tbody>
            {danhSach.length === 0 && !loi && (
              <tr>
                <td colSpan={5}>
                  <div className="rong">
                    <strong>Chưa có tài khoản quản trị nào</strong>
                    Chạy lệnh <code>npm run seed:admin</code> trong thư mục BE để tạo tài khoản đầu tiên.
                  </div>
                </td>
              </tr>
            )}
            {danhSach.map((tk) => (
              <tr key={tk._id}>
                <td>{tk.hoTen}</td>
                <td>{tk.email}</td>
                <td>
                  <span className={`vai vai-${tk.vaiTro}`}>{TEN_VAI[tk.vaiTro]}</span>
                </td>
                <td>
                  <span className={`trang-thai ${tk.dangHoatDong ? 'bat' : 'tat'}`}>
                    {tk.dangHoatDong ? 'Đang hoạt động' : 'Đã vô hiệu hoá'}
                  </span>
                </td>
                <td className="so">{dinhDangNgay(tk.lanDangNhapCuoi)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
