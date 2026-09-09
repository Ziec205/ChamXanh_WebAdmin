'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { NHAN_TRANG_THAI_DON, type TrangThaiDonHang } from '@/lib/hang-so';
import { capNhatTrangThaiDon } from './actions';

/** Khớp CHUYEN_HOP_LE trong `BE/src/modules/don-hang/don-hang.service.ts` — không nhảy cóc/lùi. */
const CHUYEN_HOP_LE: Record<TrangThaiDonHang, TrangThaiDonHang[]> = {
  'cho-xac-nhan': ['dang-giao', 'da-huy'],
  'dang-giao': ['hoan-thanh', 'da-huy'],
  'hoan-thanh': [],
  'da-huy': [],
};

export default function NutChuyenTrangThai({ id, trangThai }: { id: string; trangThai: TrangThaiDonHang }) {
  const router = useRouter();
  const [dangXu, dangChuyen] = useTransition();
  const [loi, setLoi] = useState<string | null>(null);

  const chuyenDuoc = CHUYEN_HOP_LE[trangThai];
  if (chuyenDuoc.length === 0) return <span className="phu-chu">—</span>;

  function bam(t: TrangThaiDonHang) {
    if (!confirm(`Chuyển đơn sang "${NHAN_TRANG_THAI_DON[t]}"?`)) return;
    setLoi(null);
    dangChuyen(async () => {
      const ketQua = await capNhatTrangThaiDon(id, t);
      if (!ketQua.thanhCong) setLoi(ketQua.loi);
      else router.refresh();
    });
  }

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ display: 'flex', gap: 'var(--k2)' }}>
        {chuyenDuoc.map((t) => (
          <button key={t} type="button" className="nut nut-phu" onClick={() => bam(t)} disabled={dangXu}>
            {NHAN_TRANG_THAI_DON[t]}
          </button>
        ))}
      </span>
      {loi && (
        <span className="phu-chu" style={{ color: 'var(--loi)' }}>
          {loi}
        </span>
      )}
    </span>
  );
}
