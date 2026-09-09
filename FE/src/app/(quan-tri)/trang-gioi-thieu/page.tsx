import type { Metadata } from 'next';
import Link from 'next/link';
import { goiApi } from '@/lib/api';
import NutXoa from '@/components/nut-xoa';
import type { BaiVietTuApi } from './kieu';
import { xoaBaiViet } from './actions';

export const metadata: Metadata = { title: 'Trang giới thiệu' };

export default async function TrangGioiThieuTrang() {
  let danhSach: BaiVietTuApi[] = [];
  let loi: string | null = null;

  try {
    danhSach = await goiApi<BaiVietTuApi[]>('/trang-gioi-thieu');
  } catch (e) {
    loi = (e as Error).message;
  }

  return (
    <>
      <div className="dau-trang dau-trang-co-nut">
        <div>
          <p className="nhan">Nội dung</p>
          <h1>Trang giới thiệu</h1>
          <p className="mo-ta-trang">
            Bài viết hiển thị trên web giới thiệu công khai. Sửa xong xuất bản là trang công khai
            đổi ngay trong vài giây.
          </p>
        </div>
        <Link href="/trang-gioi-thieu/moi" className="nut nut-chinh">
          + Thêm bài viết
        </Link>
      </div>

      {loi && (
        <div className="bao bao-loi" role="alert" style={{ marginBottom: 'var(--k4)' }}>
          <span aria-hidden="true">⚠</span>
          <span>{loi}</span>
        </div>
      )}

      <div className="bang-cuon">
        <table>
          <caption className="an-nhin">Danh sách bài viết trang giới thiệu</caption>
          <thead>
            <tr>
              <th scope="col">Tiêu đề</th>
              <th scope="col">Đường dẫn</th>
              <th scope="col">Trạng thái</th>
              <th scope="col">
                <span className="an-nhin">Thao tác</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {danhSach.length === 0 && !loi && (
              <tr>
                <td colSpan={4}>
                  <div className="rong">
                    <strong>Chưa có bài viết nào</strong>
                    Thêm bài đầu tiên cho web giới thiệu (Trang chủ, Chính sách bảo mật, Điều khoản…).
                  </div>
                </td>
              </tr>
            )}
            {danhSach.map((b) => (
              <tr key={b._id}>
                <td>
                  <strong>{b.tieuDe}</strong>
                  {b.tomTat && <div className="phu-chu">{b.tomTat}</div>}
                </td>
                <td className="so">/{b.duongDan}</td>
                <td>
                  <span className={`trang-thai ${b.daXuatBan ? 'bat' : 'tat'}`}>
                    {b.daXuatBan ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: 'var(--k2)' }}>
                  <Link href={`/trang-gioi-thieu/${b.duongDan}`} className="nut nut-phu nut-sua-dong">
                    Sửa
                  </Link>
                  <NutXoa hanhDong={xoaBaiViet.bind(null, b.duongDan)} xacNhan={`Xoá bài viết "${b.tieuDe}"?`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
