'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { xuLyBaoCao } from './actions';

export default function NutXuLy({ id }: { id: string }) {
  const router = useRouter();
  const [dangXu, dangChuyen] = useTransition();
  const [loi, setLoi] = useState<string | null>(null);

  function xuLy(trangThai: 'da-xu-ly' | 'da-bo-qua') {
    setLoi(null);
    const ghiChu = trangThai === 'da-xu-ly' ? (prompt('Ghi chú xử lý (tuỳ chọn):') ?? '') : '';
    dangChuyen(async () => {
      const ketQua = await xuLyBaoCao(id, trangThai, ghiChu);
      if (!ketQua.thanhCong) setLoi(ketQua.loi);
      else router.refresh();
    });
  }

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ display: 'flex', gap: 'var(--k2)' }}>
        <button type="button" className="nut nut-chinh" onClick={() => xuLy('da-xu-ly')} disabled={dangXu}>
          Đã xử lý
        </button>
        <button type="button" className="nut nut-phu" onClick={() => xuLy('da-bo-qua')} disabled={dangXu}>
          Bỏ qua
        </button>
      </span>
      {loi && (
        <span className="phu-chu" style={{ color: 'var(--loi)' }}>
          {loi}
        </span>
      )}
    </span>
  );
}
