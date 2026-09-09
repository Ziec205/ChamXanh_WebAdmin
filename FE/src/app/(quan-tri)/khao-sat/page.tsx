import type { Metadata } from 'next';
import { goiApi } from '@/lib/api';
import TheCauHoi from './the-cau-hoi';
import NutNapMacDinh from './nut-nap-mac-dinh';
import type { CauHoi } from './kieu';

export const metadata: Metadata = { title: 'Khảo sát nhập môn' };

export default async function TrangKhaoSat() {
  let danhSach: CauHoi[] = [];
  let loi: string | null = null;

  try {
    danhSach = await goiApi<CauHoi[]>('/khao-sat/cau-hoi/tat-ca');
  } catch (e) {
    loi = (e as Error).message;
  }

  const danSap = [...danhSach].sort((a, b) => a.thuTu - b.thuTu);
  const soDangAn = danhSach.filter((c) => !c.dangHienThi).length;

  return (
    <>
      <div className="dau-trang dau-trang-co-nut">
        <div>
          <p className="nhan">Nội dung</p>
          <h1>Khảo sát nhập môn</h1>
          <p className="mo-ta-trang">
            Bộ câu hỏi người dùng trả lời khi mới mở ứng dụng. Sửa được nội dung, thứ tự và đáp
            án — riêng khoá kỹ thuật của mỗi câu thì không, vì thuật toán gợi ý đọc câu trả lời
            theo đúng khoá đó.
          </p>
        </div>
        <NutNapMacDinh />
      </div>

      {loi && (
        <div className="bao bao-loi" role="alert" style={{ marginBottom: 'var(--k4)' }}>
          <span aria-hidden="true">⚠</span>
          <span>{loi}</span>
        </div>
      )}

      {soDangAn > 0 && (
        <div className="bao bao-canh-bao" style={{ marginBottom: 'var(--k4)' }}>
          <span aria-hidden="true">⚠</span>
          <span>
            {soDangAn} câu đang bị ẩn khỏi người dùng — vẫn hiện ở đây để sửa lại khi cần.
          </span>
        </div>
      )}

      {danSap.length === 0 && !loi ? (
        <div className="the rong">
          <strong>Chưa có câu hỏi nào</strong>
          Bấm &quot;Nạp bộ câu hỏi mặc định&quot; ở góc trên để bắt đầu.
        </div>
      ) : (
        <div className="danh-sach-cau-hoi">
          {danSap.map((c) => (
            <TheCauHoi key={c._id} cauHoi={c} />
          ))}
        </div>
      )}
    </>
  );
}
