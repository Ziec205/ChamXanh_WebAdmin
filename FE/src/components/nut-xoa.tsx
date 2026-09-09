'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  /** Server Action xoá — trả về {thanhCong:true} hoặc {thanhCong:false, loi}. */
  hanhDong: () => Promise<{ thanhCong: true } | { thanhCong: false; loi: string }>;
  xacNhan: string;
  nhan?: string;
}

/** Nút xoá dùng chung — hỏi xác nhận, gọi Server Action, báo lỗi bằng banner thay vì màn trắng. */
export default function NutXoa({ hanhDong, xacNhan, nhan = 'Xoá' }: Props) {
  const router = useRouter();
  const [dangXu, dangChuyen] = useTransition();
  const [loi, setLoi] = useState<string | null>(null);

  function bam() {
    if (!confirm(xacNhan)) return;
    setLoi(null);
    dangChuyen(async () => {
      const ketQua = await hanhDong();
      if (!ketQua.thanhCong) {
        setLoi(ketQua.loi);
        return;
      }
      router.refresh();
    });
  }

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
      <button type="button" className="nut nut-phu" onClick={bam} disabled={dangXu}>
        {dangXu ? 'Đang xoá…' : nhan}
      </button>
      {loi && (
        <span className="phu-chu" style={{ color: 'var(--loi)' }}>
          {loi}
        </span>
      )}
    </span>
  );
}
