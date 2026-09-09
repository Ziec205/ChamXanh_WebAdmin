'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function FormDangNhap({ tiepTuc }: { tiepTuc?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [loi, setLoi] = useState<string | null>(null);
  const [dangGui, setDangGui] = useState(false);

  async function guiForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoi(null);
    setDangGui(true);

    try {
      const res = await fetch('/api/auth/dang-nhap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, matKhau }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setLoi(body.thongBao ?? 'Đăng nhập không thành công. Vui lòng thử lại.');
        setDangGui(false);
        return;
      }

      // Đường dẫn tiếp tục phải là nội bộ — chặn chuyển hướng ra ngoài.
      const dich = tiepTuc && tiepTuc.startsWith('/') && !tiepTuc.startsWith('//')
        ? tiepTuc
        : '/bang-dieu-khien';

      router.replace(dich);
      router.refresh();
    } catch {
      setLoi('Không kết nối được tới máy chủ. Kiểm tra xem API đã chạy chưa.');
      setDangGui(false);
    }
  }

  return (
    <form onSubmit={guiForm} noValidate>
      {loi && (
        <div className="bao bao-loi" role="alert" style={{ marginBottom: 'var(--k4)' }}>
          <span aria-hidden="true">⚠</span>
          <span>{loi}</span>
        </div>
      )}

      <div className="truong" style={{ marginBottom: 'var(--k4)' }}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          placeholder="ten@chamxanh.vn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={loi ? 'true' : undefined}
          disabled={dangGui}
        />
      </div>

      <div className="truong" style={{ marginBottom: 'var(--k6)' }}>
        <label htmlFor="matKhau">Mật khẩu</label>
        <input
          id="matKhau"
          name="matKhau"
          type="password"
          autoComplete="current-password"
          required
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
          aria-invalid={loi ? 'true' : undefined}
          disabled={dangGui}
        />
        <span className="goi-y">Sai 5 lần liên tiếp, tài khoản sẽ bị khoá tạm 15 phút.</span>
      </div>

      <button
        type="submit"
        className="nut nut-chinh"
        style={{ width: '100%' }}
        disabled={dangGui || !email || !matKhau}
      >
        {dangGui ? 'Đang kiểm tra…' : 'Đăng nhập'}
      </button>

      <p
        style={{
          marginTop: 'var(--k5)',
          fontSize: 12.5,
          color: 'var(--muc-mo)',
          textAlign: 'center',
        }}
      >
        Quên mật khẩu? Liên hệ quản trị viên để được đặt lại.
      </p>
    </form>
  );
}
