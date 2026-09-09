import type { Metadata } from 'next';
import Link from 'next/link';
import { goiApi } from '@/lib/api';
import { NHAN_LOAI_KHAM_PHA } from '@/lib/hang-so';
import NutXoa from '@/components/nut-xoa';
import type { KhamPhaTuApi } from './kieu';
import { xoaKhamPha } from './actions';

export const metadata: Metadata = { title: 'Khám phá' };

export default async function TrangKhamPha() {
  let danhSach: KhamPhaTuApi[] = [];
  let loi: string | null = null;

  try {
    danhSach = await goiApi<KhamPhaTuApi[]>('/kham-pha');
  } catch (e) {
    loi = (e as Error).message;
  }

  return (
    <>
      <div className="dau-trang dau-trang-co-nut">
        <div>
          <p className="nhan">Nội dung</p>
          <h1>Khám phá</h1>
          <p className="mo-ta-trang">Mẹo chăm sóc, kiến thức và thủ thuật hiển thị ở tab Khám phá trong app.</p>
        </div>
        <Link href="/kham-pha/moi" className="nut nut-chinh">
          + Thêm nội dung
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
          <caption className="an-nhin">Danh sách nội dung khám phá</caption>
          <thead>
            <tr>
              <th scope="col">Tiêu đề</th>
              <th scope="col">Loại</th>
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
                    <strong>Chưa có nội dung khám phá nào</strong>
                    Thêm bài đầu tiên để lấp đầy tab Khám phá trong app.
                  </div>
                </td>
              </tr>
            )}
            {danhSach.map((m) => (
              <tr key={m._id}>
                <td>
                  <strong>{m.tieuDe}</strong>
                  {m.tomTat && <div className="phu-chu">{m.tomTat}</div>}
                </td>
                <td>{NHAN_LOAI_KHAM_PHA[m.loai]}</td>
                <td>
                  <span className={`trang-thai ${m.daXuatBan ? 'bat' : 'tat'}`}>
                    {m.daXuatBan ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: 'var(--k2)' }}>
                  <Link href={`/kham-pha/${m._id}`} className="nut nut-phu nut-sua-dong">
                    Sửa
                  </Link>
                  <NutXoa hanhDong={xoaKhamPha.bind(null, m._id)} xacNhan={`Xoá nội dung "${m.tieuDe}"?`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
