'use client';

import { useState } from 'react';
import Link from 'next/link';
import { dinhDangTien } from '@/lib/dinh-dang';
import {
  NHAN_TINH_NANG,
  NHAN_TRONG_SO,
  type CauHinh,
  type CongTacTinhNang,
  type GiaGoi,
  type HanMucAI,
  type ThongBaoBaoTri,
  type TrongSoGoiY,
} from './kieu';
import { capNhatCauHinh } from './actions';

/** Mỗi khối lưu độc lập — sửa xong bấm Lưu ngay khối đó, không cần đợi lưu cả trang. */
function KhoiLuu({
  ten,
  dangGui,
  loi,
  daLuu,
  onLuu,
}: {
  ten: string;
  dangGui: boolean;
  loi: string | null;
  daLuu: boolean;
  onLuu: () => void;
}) {
  return (
    <div className="hang-nut-form">
      <button type="button" className="nut nut-chinh" onClick={onLuu} disabled={dangGui}>
        {dangGui ? 'Đang lưu…' : `Lưu ${ten}`}
      </button>
      {daLuu && <span className="goi-y" style={{ color: 'var(--tot)' }}>Đã lưu.</span>}
      {loi && <span className="goi-y" style={{ color: 'var(--loi)' }}>{loi}</span>}
    </div>
  );
}

export default function FormCauHinh({ cauHinh }: { cauHinh: CauHinh }) {
  return (
    <div className="cac-khoi-cau-hinh">
      <KhoiHanMuc ban_dau={cauHinh.hanMucAI} />
      <KhoiGiaGoi ban_dau={cauHinh.giaGoi} />
      <KhoiTrongSo ban_dau={cauHinh.trongSoGoiY} />
      <KhoiCongTac ban_dau={cauHinh.congTacTinhNang} />
      <KhoiBaoTri ban_dau={cauHinh.thongBaoBaoTri} />
    </div>
  );
}

function KhoiHanMuc({ ban_dau }: { ban_dau: HanMucAI }) {
  const [gt, setGt] = useState(ban_dau);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const [daLuu, setDaLuu] = useState(false);

  async function luu() {
    setDangGui(true);
    setLoi(null);
    setDaLuu(false);
    const kq = await capNhatCauHinh({ hanMucAI: gt });
    setDangGui(false);
    if (!kq.thanhCong) setLoi(kq.loi);
    else setDaLuu(true);
  }

  return (
    <fieldset className="khoi-form">
      <legend>Hạn mức trợ lý AI</legend>
      <div className="luoi-form">
        <div className="truong">
          <label htmlFor="mienPhi">Câu hỏi miễn phí mỗi tháng</label>
          <input
            id="mienPhi"
            type="number"
            min={0}
            max={1000}
            value={gt.mienPhi}
            onChange={(e) => { setGt((g) => ({ ...g, mienPhi: Number(e.target.value) })); setDaLuu(false); }}
          />
        </div>
        <div className="truong">
          <label htmlFor="goiCoBan">Gói cơ bản (câu/tháng)</label>
          <input
            id="goiCoBan"
            type="number"
            min={1}
            max={10000}
            value={gt.goiCoBan}
            onChange={(e) => { setGt((g) => ({ ...g, goiCoBan: Number(e.target.value) })); setDaLuu(false); }}
          />
        </div>
        <div className="truong">
          <label htmlFor="goiNangCao">Gói nâng cao (câu/tháng)</label>
          <input
            id="goiNangCao"
            type="number"
            min={1}
            max={10000}
            value={gt.goiNangCao}
            onChange={(e) => { setGt((g) => ({ ...g, goiNangCao: Number(e.target.value) })); setDaLuu(false); }}
          />
        </div>
        <div className="truong">
          <label htmlFor="soLuotMoiHoiThoai">Số lượt tối đa mỗi hội thoại</label>
          <input
            id="soLuotMoiHoiThoai"
            type="number"
            min={2}
            max={100}
            value={gt.soLuotMoiHoiThoai}
            onChange={(e) => { setGt((g) => ({ ...g, soLuotMoiHoiThoai: Number(e.target.value) })); setDaLuu(false); }}
          />
        </div>
        <div className="truong">
          <label htmlFor="soCauMoiGio">Giới hạn cứng — số câu mỗi giờ</label>
          <input
            id="soCauMoiGio"
            type="number"
            min={1}
            max={1000}
            value={gt.soCauMoiGio}
            onChange={(e) => { setGt((g) => ({ ...g, soCauMoiGio: Number(e.target.value) })); setDaLuu(false); }}
          />
          <span className="goi-y">Chặn chi phí bất thường nếu token bị lộ.</span>
        </div>
      </div>
      <KhoiLuu ten="hạn mức" dangGui={dangGui} loi={loi} daLuu={daLuu} onLuu={luu} />
    </fieldset>
  );
}

function KhoiGiaGoi({ ban_dau }: { ban_dau: GiaGoi }) {
  const [gt, setGt] = useState(ban_dau);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const [daLuu, setDaLuu] = useState(false);

  async function luu() {
    setDangGui(true);
    setLoi(null);
    setDaLuu(false);
    const kq = await capNhatCauHinh({ giaGoi: gt });
    setDangGui(false);
    if (!kq.thanhCong) setLoi(kq.loi);
    else setDaLuu(true);
  }

  return (
    <fieldset className="khoi-form">
      <legend>Giá gói</legend>
      <div className="luoi-form">
        <div className="truong">
          <label htmlFor="giaCoBan">Gói cơ bản (đ)</label>
          <input
            id="giaCoBan"
            type="number"
            min={0}
            value={gt.coBan}
            onChange={(e) => { setGt((g) => ({ ...g, coBan: Number(e.target.value) })); setDaLuu(false); }}
          />
          <span className="goi-y">{dinhDangTien(gt.coBan)}</span>
        </div>
        <div className="truong">
          <label htmlFor="giaNangCao">Gói nâng cao (đ)</label>
          <input
            id="giaNangCao"
            type="number"
            min={0}
            value={gt.nangCao}
            onChange={(e) => { setGt((g) => ({ ...g, nangCao: Number(e.target.value) })); setDaLuu(false); }}
          />
          <span className="goi-y">{dinhDangTien(gt.nangCao)}</span>
        </div>
      </div>
      <KhoiLuu ten="giá gói" dangGui={dangGui} loi={loi} daLuu={daLuu} onLuu={luu} />
    </fieldset>
  );
}

function KhoiTrongSo({ ban_dau }: { ban_dau: TrongSoGoiY }) {
  const [gt, setGt] = useState(ban_dau);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const [daLuu, setDaLuu] = useState(false);

  const tong = Object.values(gt).reduce((a, b) => a + b, 0);

  async function luu() {
    setDangGui(true);
    setLoi(null);
    setDaLuu(false);
    const kq = await capNhatCauHinh({ trongSoGoiY: gt });
    setDangGui(false);
    if (!kq.thanhCong) setLoi(kq.loi);
    else setDaLuu(true);
  }

  return (
    <fieldset className="khoi-form">
      <legend>Trọng số thuật toán gợi ý</legend>
      <p className="goi-y" style={{ marginBottom: 'var(--k4)' }}>
        Tổng hiện tại: <strong>{tong}</strong>. Không bắt buộc phải bằng 100, nhưng để điểm số ở
        trang <Link href="/thu-goi-y">Thử gợi ý</Link> dễ đọc thì nên giữ tổng gần 100.
      </p>
      <div className="luoi-form">
        {(Object.keys(NHAN_TRONG_SO) as (keyof TrongSoGoiY)[]).map((k) => (
          <div key={k} className="truong">
            <label htmlFor={`trongso-${k}`}>{NHAN_TRONG_SO[k]}</label>
            <input
              id={`trongso-${k}`}
              type="number"
              min={0}
              max={100}
              value={gt[k]}
              onChange={(e) => { setGt((g) => ({ ...g, [k]: Number(e.target.value) })); setDaLuu(false); }}
            />
          </div>
        ))}
      </div>
      <KhoiLuu ten="trọng số" dangGui={dangGui} loi={loi} daLuu={daLuu} onLuu={luu} />
    </fieldset>
  );
}

function KhoiCongTac({ ban_dau }: { ban_dau: CongTacTinhNang }) {
  const [gt, setGt] = useState(ban_dau);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const [daLuu, setDaLuu] = useState(false);

  async function luu() {
    setDangGui(true);
    setLoi(null);
    setDaLuu(false);
    const kq = await capNhatCauHinh({ congTacTinhNang: gt });
    setDangGui(false);
    if (!kq.thanhCong) setLoi(kq.loi);
    else setDaLuu(true);
  }

  return (
    <fieldset className="khoi-form">
      <legend>Công tắc tính năng</legend>
      <p className="goi-y" style={{ marginBottom: 'var(--k4)' }}>
        Tắt một tính năng là nó biến mất khỏi ứng dụng ngay, không cần phát hành bản mới.
      </p>
      <div className="nhom-lua-chon" style={{ border: 'none', padding: 0, margin: 0 }}>
        {(Object.keys(NHAN_TINH_NANG) as (keyof CongTacTinhNang)[]).map((k) => (
          <label key={k} className="lua-chon-don">
            <input
              type="checkbox"
              checked={gt[k]}
              onChange={(e) => { setGt((g) => ({ ...g, [k]: e.target.checked })); setDaLuu(false); }}
            />
            {NHAN_TINH_NANG[k]}
          </label>
        ))}
      </div>
      <KhoiLuu ten="công tắc" dangGui={dangGui} loi={loi} daLuu={daLuu} onLuu={luu} />
    </fieldset>
  );
}

function KhoiBaoTri({ ban_dau }: { ban_dau: ThongBaoBaoTri }) {
  const [gt, setGt] = useState(ban_dau);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const [daLuu, setDaLuu] = useState(false);

  async function luu() {
    setDangGui(true);
    setLoi(null);
    setDaLuu(false);
    const kq = await capNhatCauHinh({ thongBaoBaoTri: gt });
    setDangGui(false);
    if (!kq.thanhCong) setLoi(kq.loi);
    else setDaLuu(true);
  }

  return (
    <fieldset className="khoi-form">
      <legend>Thông báo bảo trì</legend>
      <label className="lua-chon-don" style={{ marginBottom: 'var(--k4)' }}>
        <input
          type="checkbox"
          checked={gt.dangBat}
          onChange={(e) => { setGt((g) => ({ ...g, dangBat: e.target.checked })); setDaLuu(false); }}
        />
        Đang bật (hiện thông báo cho người dùng)
      </label>
      <div className="truong">
        <label htmlFor="noiDungBaoTri">Nội dung thông báo</label>
        <textarea
          id="noiDungBaoTri"
          rows={3}
          maxLength={500}
          value={gt.noiDung}
          onChange={(e) => { setGt((g) => ({ ...g, noiDung: e.target.value })); setDaLuu(false); }}
        />
        <span className="goi-y">{gt.noiDung.length}/500 ký tự</span>
      </div>
      <KhoiLuu ten="thông báo" dangGui={dangGui} loi={loi} daLuu={daLuu} onLuu={luu} />
    </fieldset>
  );
}
