'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TEN_VAI, type VaiTro } from '@/lib/vai-tro';

export default function ThanhTren({
  nguoiDung,
}: {
  nguoiDung: { email: string; hoTen: string; vaiTro: VaiTro };
}) {
  const router = useRouter();
  const [dangThoat, setDangThoat] = useState(false);

  async function dangXuat() {
    setDangThoat(true);
    await fetch('/api/auth/dang-xuat', { method: 'POST' }).catch(() => undefined);
    router.replace('/dang-nhap');
    router.refresh();
  }

  const chuCai = nguoiDung.email.charAt(0).toUpperCase();

  return (
    <header className="thanh-tren">
      <div className="thong-tin-nguoi-dung">
        <div className="anh-dai-dien" aria-hidden="true">{chuCai}</div>
        <div>
          <p className="ten-nguoi-dung">{nguoiDung.email}</p>
          <span className={`vai vai-${nguoiDung.vaiTro}`}>{TEN_VAI[nguoiDung.vaiTro]}</span>
        </div>
      </div>

      <button type="button" className="nut nut-phu" onClick={dangXuat} disabled={dangThoat}>
        {dangThoat ? 'Đang thoát…' : 'Đăng xuất'}
      </button>
    </header>
  );
}
