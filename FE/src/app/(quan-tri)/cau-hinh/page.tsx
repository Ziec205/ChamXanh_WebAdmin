import type { Metadata } from 'next';
import { goiApi } from '@/lib/api';
import FormCauHinh from './form-cau-hinh';
import type { CauHinh } from './kieu';

export const metadata: Metadata = { title: 'Cấu hình' };

export default async function TrangCauHinh() {
  let cauHinh: CauHinh | null = null;
  let loi: string | null = null;

  try {
    cauHinh = await goiApi<CauHinh>('/cau-hinh');
  } catch (e) {
    loi = (e as Error).message;
  }

  return (
    <>
      <div className="dau-trang">
        <p className="nhan">Hệ thống</p>
        <h1>Cấu hình</h1>
        <p className="mo-ta-trang">
          Đổi hạn mức, giá gói, trọng số gợi ý, công tắc tính năng và thông báo bảo trì — có hiệu
          lực ngay, không cần phát hành lại ứng dụng. Chỉ vai Quản trị được sửa; mọi thay đổi đều
          ghi vào Nhật ký thao tác kèm giá trị trước và sau.
        </p>
      </div>

      {loi && (
        <div className="bao bao-loi" role="alert" style={{ marginBottom: 'var(--k4)' }}>
          <span aria-hidden="true">⚠</span>
          <span>{loi}</span>
        </div>
      )}

      {cauHinh && <FormCauHinh cauHinh={cauHinh} />}
    </>
  );
}
