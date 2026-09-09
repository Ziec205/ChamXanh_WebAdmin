import type { Metadata } from 'next';
import Link from 'next/link';
import { goiApi } from '@/lib/api';
import { NHAN_NHOM_SAN_PHAM } from '@/lib/hang-so';
import { dinhDangTien } from '@/lib/dinh-dang';
import NutXoa from '@/components/nut-xoa';
import type { SanPhamTuApi } from './kieu';
import { xoaSanPham } from './actions';

export const metadata: Metadata = { title: 'Sản phẩm' };

export default async function TrangSanPham() {
  let danhSach: SanPhamTuApi[] = [];
  let loi: string | null = null;

  try {
    danhSach = await goiApi<SanPhamTuApi[]>('/san-pham');
  } catch (e) {
    loi = (e as Error).message;
  }

  return (
    <>
      <div className="dau-trang dau-trang-co-nut">
        <div>
          <p className="nhan">Chợ Vật Tư</p>
          <h1>Sản phẩm</h1>
          <p className="mo-ta-trang">
            Hàng của chính Chạm Xanh, có tồn kho — khác liên kết tiếp thị dẫn ra sàn ngoài. Mở bán
            bằng nhóm hàng không hỏng trước (đất, phân, chậu, hạt giống, dụng cụ).
          </p>
        </div>
        <Link href="/san-pham/moi" className="nut nut-chinh">
          + Thêm sản phẩm
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
          <caption className="an-nhin">Danh sách sản phẩm Chợ Vật Tư</caption>
          <thead>
            <tr>
              <th scope="col">Tên</th>
              <th scope="col">Nhóm</th>
              <th scope="col">Giá</th>
              <th scope="col">Tồn kho</th>
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
                    <strong>Chưa có sản phẩm nào</strong>
                    Thêm sản phẩm đầu tiên để mở Chợ Vật Tư.
                  </div>
                </td>
              </tr>
            )}
            {danhSach.map((s) => (
              <tr key={s._id}>
                <td>
                  <strong>{s.ten}</strong>
                </td>
                <td>{NHAN_NHOM_SAN_PHAM[s.nhom]}</td>
                <td className="so">{dinhDangTien(s.gia)}</td>
                <td className="so">
                  {s.tonKho}
                  {s.tonKho === 0 && <div className="phu-chu">Hết hàng</div>}
                </td>
                <td>
                  <span className={`trang-thai ${s.dangBan ? 'bat' : 'tat'}`}>
                    {s.dangBan ? 'Đang bán' : 'Ngừng bán'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: 'var(--k2)' }}>
                  <Link href={`/san-pham/${s._id}`} className="nut nut-phu nut-sua-dong">
                    Sửa
                  </Link>
                  <NutXoa hanhDong={xoaSanPham.bind(null, s._id)} xacNhan={`Xoá sản phẩm "${s.ten}"?`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
