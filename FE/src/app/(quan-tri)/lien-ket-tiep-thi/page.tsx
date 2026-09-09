import type { Metadata } from 'next';
import Link from 'next/link';
import { goiApi } from '@/lib/api';
import { NHAN_SAN } from '@/lib/hang-so';
import NutXoa from '@/components/nut-xoa';
import type { LienKetTuApi } from './kieu';
import { xoaLienKet } from './actions';

export const metadata: Metadata = { title: 'Liên kết tiếp thị' };

export default async function TrangLienKetTiepThi() {
  let danhSach: LienKetTuApi[] = [];
  let loi: string | null = null;

  try {
    danhSach = await goiApi<LienKetTuApi[]>('/lien-ket-tiep-thi');
  } catch (e) {
    loi = (e as Error).message;
  }

  return (
    <>
      <div className="dau-trang dau-trang-co-nut">
        <div>
          <p className="nhan">Nội dung</p>
          <h1>Liên kết tiếp thị</h1>
          <p className="mo-ta-trang">
            Trợ lý AI chỉ chọn thẻ (tags) khi trả lời, backend tự ghép URL thật — người dùng
            không bao giờ thấy Claude bịa hay sửa link.
          </p>
        </div>
        <Link href="/lien-ket-tiep-thi/moi" className="nut nut-chinh">
          + Thêm liên kết
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
          <caption className="an-nhin">Danh sách liên kết tiếp thị</caption>
          <thead>
            <tr>
              <th scope="col">Tiêu đề</th>
              <th scope="col">Sàn</th>
              <th scope="col">Thẻ</th>
              <th scope="col">Lượt bấm</th>
              <th scope="col">Hiển thị</th>
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
                    <strong>Chưa có liên kết tiếp thị nào</strong>
                    Thêm liên kết đầu tiên để trợ lý AI có thể gợi ý sản phẩm.
                  </div>
                </td>
              </tr>
            )}
            {danhSach.map((lk) => (
              <tr key={lk._id}>
                <td>
                  <strong>{lk.tieuDe}</strong>
                  <div className="phu-chu">{lk.url}</div>
                </td>
                <td>{NHAN_SAN[lk.san]}</td>
                <td>{lk.tags.join(', ') || <span className="phu-chu">—</span>}</td>
                <td className="so">{lk.luotBam}</td>
                <td>
                  <span className={`trang-thai ${lk.dangHienThi ? 'bat' : 'tat'}`}>
                    {lk.dangHienThi ? 'Đang hiển thị' : 'Đang ẩn'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: 'var(--k2)' }}>
                  <Link href={`/lien-ket-tiep-thi/${lk._id}`} className="nut nut-phu nut-sua-dong">
                    Sửa
                  </Link>
                  <NutXoa
                    hanhDong={xoaLienKet.bind(null, lk._id)}
                    xacNhan={`Xoá liên kết "${lk.tieuDe}"?`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
