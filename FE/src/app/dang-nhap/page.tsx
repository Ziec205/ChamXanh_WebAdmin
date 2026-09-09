import type { Metadata } from 'next';
import FormDangNhap from './form-dang-nhap';

export const metadata: Metadata = { title: 'Đăng nhập' };

export default async function TrangDangNhap({
  searchParams,
}: {
  searchParams: Promise<{ 'tiep-tuc'?: string }>;
}) {
  const thamSo = await searchParams;

  return (
    <main className="man-dang-nhap">
      <section className="cot-gioi-thieu" aria-hidden="true">
        <div className="noi-dung-gioi-thieu">
          <div className="logo-lon">🌿</div>
          <h2 className="ten-thuong-hieu">Chạm Xanh</h2>
          <p className="cau-dan">
            Nơi quản lý dữ liệu cây trồng, nội dung ứng dụng và cộng đồng người trồng cây.
          </p>
        </div>
      </section>

      <section className="cot-form">
        <div className="hop-form">
          <p className="nhan">Web Admin</p>
          <h1 className="tieu-de">Đăng nhập</h1>
          <p className="phu-de">Dùng tài khoản quản trị được cấp để tiếp tục.</p>
          <FormDangNhap tiepTuc={thamSo['tiep-tuc']} />
        </div>
      </section>
    </main>
  );
}
