'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { khoaNguoiDung, kichHoatNguoiDung } from './actions';

interface Props {
  id: string;
  dangHoatDong: boolean;
}

/** Khoá hỏi lý do qua prompt() — đủ dùng cho thao tác hiếm, không cần dựng modal riêng. */
export default function NutKhoa({ id, dangHoatDong }: Props) {
  const router = useRouter();
  const [dangXu, dangChuyen] = useTransition();
  const [loi, setLoi] = useState<string | null>(null);

  function bam() {
    setLoi(null);
    if (dangHoatDong) {
      const lyDo = prompt('Lý do khoá tài khoản:') ?? '';
      if (lyDo.trim() === '') return;
      dangChuyen(async () => {
        const ketQua = await khoaNguoiDung(id, lyDo);
        if (!ketQua.thanhCong) setLoi(ketQua.loi);
        else router.refresh();
      });
    } else {
      if (!confirm('Kích hoạt lại tài khoản này?')) return;
      dangChuyen(async () => {
        const ketQua = await kichHoatNguoiDung(id);
        if (!ketQua.thanhCong) setLoi(ketQua.loi);
        else router.refresh();
      });
    }
  }

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
      <button type="button" className="nut nut-phu" onClick={bam} disabled={dangXu}>
        {dangXu ? 'Đang xử lý…' : dangHoatDong ? 'Khoá' : 'Kích hoạt lại'}
      </button>
      {loi && (
        <span className="phu-chu" style={{ color: 'var(--loi)' }}>
          {loi}
        </span>
      )}
    </span>
  );
}
