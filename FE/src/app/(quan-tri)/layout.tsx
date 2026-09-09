import { redirect } from 'next/navigation';
import { goiApi, LoiApi, type TaiKhoanDangNhap } from '@/lib/api';
import ThanhBen from '@/components/thanh-ben';
import ThanhTren from '@/components/thanh-tren';

export default async function KhungQuanTri({ children }: { children: React.ReactNode }) {
  let nguoiDung: TaiKhoanDangNhap;

  try {
    // API là nơi quyết định quyền thật, không phải middleware.
    const phien = await goiApi<{ id: string; email: string; role: TaiKhoanDangNhap['vaiTro'] }>(
      '/auth/toi',
    );
    nguoiDung = {
      id: phien.id,
      email: phien.email,
      hoTen: phien.email.split('@')[0],
      vaiTro: phien.role,
    };
  } catch (e) {
    if (e instanceof LoiApi && (e.maLoi === 401 || e.maLoi === 403)) {
      redirect('/dang-nhap');
    }
    return (
      <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div className="the" style={{ maxWidth: '52ch' }}>
          <h1 style={{ color: 'var(--loi)', marginBottom: 10 }}>Không kết nối được API</h1>
          <p style={{ color: 'var(--muc-phu)', marginBottom: 16 }}>
            {(e as Error).message}
          </p>
          <div className="bao bao-canh-bao">
            <span aria-hidden="true">⚠</span>
            <span>
              Kiểm tra xem backend đã chạy chưa: mở thư mục <code>BE</code> rồi chạy{' '}
              <code>npm run dev</code>. Mặc định API nghe ở cổng 3001.
            </span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="khung">
      <ThanhBen vaiTro={nguoiDung.vaiTro} />
      <div className="cot-chinh">
        <ThanhTren nguoiDung={nguoiDung} />
        <main className="vung-noi-dung">{children}</main>
      </div>
    </div>
  );
}
