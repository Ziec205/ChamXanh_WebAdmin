'use client';

import { useState } from 'react';
import { napBoCauHoiMacDinh } from './actions';

export default function NutNapMacDinh() {
  const [dangGui, setDangGui] = useState(false);
  const [thongBao, setThongBao] = useState<string | null>(null);
  const [loi, setLoi] = useState<string | null>(null);

  async function bamNap() {
    setDangGui(true);
    setLoi(null);
    setThongBao(null);

    const ketQua = await napBoCauHoiMacDinh();

    if (!ketQua.thanhCong) {
      setLoi(ketQua.loi);
    } else if (ketQua.themMoi === 0) {
      setThongBao('Đã có đủ 9 câu hỏi mặc định, không thêm gì mới.');
    } else {
      setThongBao(`Đã thêm ${ketQua.themMoi} câu hỏi mới. Bỏ qua ${ketQua.boQua} câu đã có sẵn.`);
    }
    setDangGui(false);
  }

  return (
    <div>
      <button type="button" className="nut nut-phu" onClick={bamNap} disabled={dangGui}>
        {dangGui ? 'Đang nạp…' : 'Nạp bộ câu hỏi mặc định'}
      </button>
      {thongBao && (
        <p className="goi-y" style={{ marginTop: 6 }}>
          {thongBao}
        </p>
      )}
      {loi && (
        <p className="goi-y" style={{ marginTop: 6, color: 'var(--loi)' }}>
          {loi}
        </p>
      )}
    </div>
  );
}
