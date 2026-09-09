import type { Metadata } from 'next';
import Link from 'next/link';
import { goiApi } from '@/lib/api';

export const metadata: Metadata = { title: 'Cây trồng' };

interface Cay {
  _id: string;
  ma: string;
  tenVi: string;
  tenKhoaHoc: string;
  nhom: string;
  anhSangToiThieu: string;
  anhSangLyTuong: string;
  chuKyTuoiMuaKho: number;
  doKho: number;
  anToanThuNuoi: boolean;
  daKiemChung: boolean;
  dangHienThi: boolean;
}

interface TrangCay {
  muc: Cay[];
  tong: number;
  soTrang: number;
}

interface ThongKe {
  tong: number;
  daKiemChung: number;
  dangHienThi: number;
  anToanThuNuoi: number;
}

export default async function TrangCayTrong({
  searchParams,
}: {
  searchParams: Promise<{ tim?: string }>;
}) {
  const { tim } = await searchParams;

  let danhSach: TrangCay = { muc: [], tong: 0, soTrang: 0 };
  let thongKe: ThongKe = { tong: 0, daKiemChung: 0, dangHienThi: 0, anToanThuNuoi: 0 };
  let loi: string | null = null;

  try {
    const duongDan = `/cay-trong?moiTrang=100${tim ? `&tim=${encodeURIComponent(tim)}` : ''}`;
    [danhSach, thongKe] = await Promise.all([
      goiApi<TrangCay>(duongDan),
      goiApi<ThongKe>('/cay-trong/thong-ke'),
    ]);
  } catch (e) {
    loi = (e as Error).message;
  }

  const chuaKiemChung = thongKe.tong - thongKe.daKiemChung;

  return (
    <>
      <div className="dau-trang dau-trang-co-nut">
        <div>
          <p className="nhan">Nội dung</p>
          <h1>Cây trồng</h1>
          <p className="mo-ta-trang">
            Dữ liệu ở đây nuôi cùng lúc ba thứ: thuật toán gợi ý, bộ sinh lịch chăm sóc, và phần
            trả lời của trợ lý AI. Thiếu một trường là một trong ba thứ đó phải đoán.
          </p>
        </div>
        <Link href="/cay-trong/moi" className="nut nut-chinh">
          + Thêm loài cây
        </Link>
      </div>

      {loi && (
        <div className="bao bao-loi" role="alert" style={{ marginBottom: 'var(--k4)' }}>
          <span aria-hidden="true">⚠</span>
          <span>{loi}</span>
        </div>
      )}

      <div className="luoi-so-lieu">
        <div className="o-so-lieu">
          <p className="nhan">Tổng số loài</p>
          <p className="con-so">{thongKe.tong}</p>
          <p className="chu-thich">trong cơ sở dữ liệu</p>
        </div>
        <div className="o-so-lieu">
          <p className="nhan">Đã kiểm chứng</p>
          <p className="con-so">{thongKe.daKiemChung}</p>
          <p className="chu-thich">đối chiếu ít nhất hai nguồn</p>
        </div>
        <div className="o-so-lieu">
          <p className="nhan">Đang hiển thị</p>
          <p className="con-so">{thongKe.dangHienThi}</p>
          <p className="chu-thich">xuất hiện trong gợi ý</p>
        </div>
        <div className="o-so-lieu">
          <p className="nhan">An toàn thú nuôi</p>
          <p className="con-so">{thongKe.anToanThuNuoi}</p>
          <p className="chu-thich">gợi ý được cho nhà có chó mèo</p>
        </div>
      </div>

      {chuaKiemChung > 0 && (
        <div className="bao bao-canh-bao" style={{ marginTop: 'var(--k4)' }}>
          <span aria-hidden="true">⚠</span>
          <span>
            <strong>{chuaKiemChung} loài chưa được kiểm chứng.</strong> Đây là dữ liệu nháp do máy
            soạn. Cần người thật đối chiếu ít nhất hai nguồn đáng tin cậy trước khi bật cờ đã kiểm
            chứng.
          </span>
        </div>
      )}

      <form className="thanh-tim" role="search">
        <label htmlFor="tim" className="an-nhin">
          Tìm cây theo tên tiếng Việt
        </label>
        <input
          id="tim"
          name="tim"
          type="search"
          placeholder="Tìm theo tên tiếng Việt…"
          defaultValue={tim ?? ''}
        />
        <button type="submit" className="nut nut-phu">
          Tìm
        </button>
      </form>

      <div className="bang-cuon">
        <table>
          <caption className="an-nhin">Danh sách loài cây trong hệ thống</caption>
          <thead>
            <tr>
              <th scope="col">Tên</th>
              <th scope="col">Nhóm</th>
              <th scope="col">Ánh sáng</th>
              <th scope="col">Tưới</th>
              <th scope="col">Độ khó</th>
              <th scope="col">Thú nuôi</th>
              <th scope="col">Kiểm chứng</th>
              <th scope="col">
                <span className="an-nhin">Sửa</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {danhSach.muc.length === 0 && !loi && (
              <tr>
                <td colSpan={8}>
                  <div className="rong">
                    <strong>{tim ? 'Không tìm thấy loài nào khớp' : 'Chưa có dữ liệu cây'}</strong>
                    {tim ? (
                      <>Thử từ khoá khác, hoặc bỏ trống ô tìm để xem toàn bộ.</>
                    ) : (
                      <>
                        Chạy <code>npm run nhap:cay</code> trong thư mục BE để nhập 24 loài mẫu từ
                        tệp Excel.
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )}
            {danhSach.muc.map((c) => (
              <tr key={c._id}>
                <td>
                  <strong>{c.tenVi}</strong>
                  {c.tenKhoaHoc && <div className="phu-chu">{c.tenKhoaHoc}</div>}
                </td>
                <td>{c.nhom}</td>
                <td>
                  {c.anhSangToiThieu}
                  {c.anhSangLyTuong !== c.anhSangToiThieu && (
                    <div className="phu-chu">lý tưởng: {c.anhSangLyTuong}</div>
                  )}
                </td>
                <td className="so">{c.chuKyTuoiMuaKho} ngày</td>
                <td className="so">{c.doKho}/5</td>
                <td>
                  {c.anToanThuNuoi ? (
                    <span className="chip chip-tot">An toàn</span>
                  ) : (
                    <span className="chip chip-canh-bao">Có độc</span>
                  )}
                </td>
                <td>
                  <span className={`trang-thai ${c.daKiemChung ? 'bat' : 'tat'}`}>
                    {c.daKiemChung ? 'Đã kiểm chứng' : 'Bản nháp'}
                  </span>
                </td>
                <td>
                  <Link href={`/cay-trong/${c.ma}`} className="nut nut-phu nut-sua-dong">
                    Sửa
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
