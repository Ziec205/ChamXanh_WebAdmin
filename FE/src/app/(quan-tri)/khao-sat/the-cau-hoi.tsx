'use client';

import { useState } from 'react';
import type { CauHoi, DapAn } from './kieu';
import { suaCauHoi, type SuaCauHoiInput } from './actions';

export default function TheCauHoi({ cauHoi }: { cauHoi: CauHoi }) {
  const [dangMo, setDangMo] = useState(false);
  const [du_lieu, setDuLieu] = useState<SuaCauHoiInput>(() => layDuLieuGoc(cauHoi));
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  function moLai() {
    setDuLieu(layDuLieuGoc(cauHoi));
    setLoi(null);
    setDangMo(true);
  }

  function themDapAn() {
    setDuLieu((d) => ({ ...d, dapAn: [...d.dapAn, { giaTri: '', nhan: '', moTa: '' }] }));
  }

  function xoaDapAn(chiSo: number) {
    setDuLieu((d) => ({ ...d, dapAn: d.dapAn.filter((_, i) => i !== chiSo) }));
  }

  function suaDapAn(chiSo: number, truong: keyof DapAn, gia_tri: string) {
    setDuLieu((d) => ({
      ...d,
      dapAn: d.dapAn.map((da, i) => (i === chiSo ? { ...da, [truong]: gia_tri } : da)),
    }));
  }

  async function luu() {
    setDangGui(true);
    setLoi(null);

    const ketQua = await suaCauHoi(cauHoi.khoa, du_lieu);

    if (!ketQua.thanhCong) {
      setLoi(ketQua.loi);
      setDangGui(false);
      return;
    }

    setDangGui(false);
    setDangMo(false);
  }

  if (!dangMo) {
    return (
      <div className="the the-cau-hoi">
        <div className="dau-the-cau-hoi">
          <span className="thu-tu-cau-hoi">#{cauHoi.thuTu}</span>
          <div className="noi-dung-cau-hoi-tom-tat">
            <h3>{cauHoi.cauHoi}</h3>
            <p className="ma-khoa-cau-hoi">
              khoá: <code>{cauHoi.khoa}</code> · {cauHoi.dapAn.length} đáp án
              {cauHoi.batBuoc ? ' · bắt buộc' : ' · không bắt buộc'}
              {cauHoi.nhieuLuaChon ? ' · chọn nhiều' : ''}
            </p>
          </div>
          <span className={`trang-thai ${cauHoi.dangHienThi ? 'bat' : 'tat'}`}>
            {cauHoi.dangHienThi ? 'Đang hiển thị' : 'Đang ẩn'}
          </span>
          <button type="button" className="nut nut-phu" onClick={moLai}>
            Sửa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="the the-cau-hoi the-cau-hoi-dang-mo">
      {loi && (
        <div className="bao bao-loi" role="alert" style={{ marginBottom: 'var(--k4)' }}>
          <span aria-hidden="true">⚠</span>
          <span>{loi}</span>
        </div>
      )}

      <p className="ma-khoa-cau-hoi" style={{ marginBottom: 'var(--k4)' }}>
        Khoá kỹ thuật: <code>{cauHoi.khoa}</code> — không đổi được, thuật toán gợi ý đọc câu trả
        lời theo đúng khoá này.
      </p>

      <div className="luoi-form">
        <div className="truong">
          <label htmlFor={`thuTu-${cauHoi.khoa}`}>Thứ tự hiển thị</label>
          <input
            id={`thuTu-${cauHoi.khoa}`}
            type="number"
            min={1}
            value={du_lieu.thuTu}
            onChange={(e) => setDuLieu((d) => ({ ...d, thuTu: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div className="truong" style={{ marginBottom: 'var(--k4)' }}>
        <label htmlFor={`cauHoi-${cauHoi.khoa}`}>Nội dung câu hỏi</label>
        <input
          id={`cauHoi-${cauHoi.khoa}`}
          value={du_lieu.cauHoi}
          onChange={(e) => setDuLieu((d) => ({ ...d, cauHoi: e.target.value }))}
        />
      </div>

      <div className="truong" style={{ marginBottom: 'var(--k4)' }}>
        <label htmlFor={`moTa-${cauHoi.khoa}`}>Mô tả phụ (không bắt buộc)</label>
        <input
          id={`moTa-${cauHoi.khoa}`}
          value={du_lieu.moTa}
          onChange={(e) => setDuLieu((d) => ({ ...d, moTa: e.target.value }))}
        />
      </div>

      <div className="nhom-lua-chon" style={{ marginBottom: 'var(--k4)' }}>
        <label className="lua-chon-don">
          <input
            type="checkbox"
            checked={du_lieu.batBuoc}
            onChange={(e) => setDuLieu((d) => ({ ...d, batBuoc: e.target.checked }))}
          />
          Bắt buộc trả lời
        </label>
        <label className="lua-chon-don">
          <input
            type="checkbox"
            checked={du_lieu.nhieuLuaChon}
            onChange={(e) => setDuLieu((d) => ({ ...d, nhieuLuaChon: e.target.checked }))}
          />
          Cho chọn nhiều đáp án
        </label>
        <label className="lua-chon-don">
          <input
            type="checkbox"
            checked={du_lieu.dangHienThi}
            onChange={(e) => setDuLieu((d) => ({ ...d, dangHienThi: e.target.checked }))}
          />
          Đang hiển thị cho người dùng
        </label>
      </div>

      <h4 className="tieu-de-dap-an">Đáp án</h4>
      <div className="bao bao-canh-bao" style={{ marginBottom: 'var(--k4)' }}>
        <span aria-hidden="true">⚠</span>
        <span>
          Cột <strong>giá trị</strong> phải khớp chính xác với chuỗi mà thuật toán gợi ý đang dùng
          — sửa sai chính tả ở đây sẽ khiến câu trả lời không được thuật toán nhận diện. Chỉ đổi
          nếu chắc chắn.
        </span>
      </div>

      {du_lieu.dapAn.map((da, chiSo) => (
        <div key={chiSo} className="dong-dap-an">
          <div className="luoi-form">
            <div className="truong">
              <label htmlFor={`giaTri-${cauHoi.khoa}-${chiSo}`}>Giá trị (gửi lên API)</label>
              <input
                id={`giaTri-${cauHoi.khoa}-${chiSo}`}
                required
                value={da.giaTri}
                onChange={(e) => suaDapAn(chiSo, 'giaTri', e.target.value)}
              />
            </div>
            <div className="truong">
              <label htmlFor={`nhan-${cauHoi.khoa}-${chiSo}`}>Nhãn hiển thị</label>
              <input
                id={`nhan-${cauHoi.khoa}-${chiSo}`}
                required
                value={da.nhan}
                onChange={(e) => suaDapAn(chiSo, 'nhan', e.target.value)}
              />
            </div>
            <div className="truong">
              <label htmlFor={`moTaDapAn-${cauHoi.khoa}-${chiSo}`}>Ghi chú thêm</label>
              <input
                id={`moTaDapAn-${cauHoi.khoa}-${chiSo}`}
                value={da.moTa}
                onChange={(e) => suaDapAn(chiSo, 'moTa', e.target.value)}
              />
            </div>
          </div>
          <button
            type="button"
            className="nut nut-phu nut-xoa-dong"
            onClick={() => xoaDapAn(chiSo)}
            disabled={du_lieu.dapAn.length <= 1}
            aria-label={`Xoá đáp án thứ ${chiSo + 1}`}
            title={du_lieu.dapAn.length <= 1 ? 'Câu hỏi phải có ít nhất một đáp án' : undefined}
          >
            Xoá
          </button>
        </div>
      ))}
      <button type="button" className="nut nut-phu" onClick={themDapAn}>
        + Thêm đáp án
      </button>

      <div className="hang-nut-form">
        <button type="button" className="nut nut-chinh" onClick={luu} disabled={dangGui}>
          {dangGui ? 'Đang lưu…' : 'Lưu thay đổi'}
        </button>
        <button
          type="button"
          className="nut nut-phu"
          onClick={() => setDangMo(false)}
          disabled={dangGui}
        >
          Huỷ
        </button>
      </div>
    </div>
  );
}

function layDuLieuGoc(cauHoi: CauHoi): SuaCauHoiInput {
  return {
    thuTu: cauHoi.thuTu,
    cauHoi: cauHoi.cauHoi,
    moTa: cauHoi.moTa,
    nhieuLuaChon: cauHoi.nhieuLuaChon,
    batBuoc: cauHoi.batBuoc,
    dapAn: cauHoi.dapAn.map((d) => ({ ...d })),
    dangHienThi: cauHoi.dangHienThi,
  };
}
