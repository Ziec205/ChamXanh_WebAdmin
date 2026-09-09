'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { BAI_VIET_RONG, type DuLieuBaiViet } from './kieu';
import { taoBaiViet, capNhatBaiViet } from './actions';

interface Props {
  baiVietBanDau: (DuLieuBaiViet & { _id: string }) | null;
}

export default function FormBaiViet({ baiVietBanDau }: Props) {
  const router = useRouter();
  const dangSua = baiVietBanDau !== null;
  const [du_lieu, setDuLieu] = useState<DuLieuBaiViet>(baiVietBanDau ?? BAI_VIET_RONG);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  function capNhatTruong<K extends keyof DuLieuBaiViet>(khoa: K, gia_tri: DuLieuBaiViet[K]) {
    setDuLieu((d) => ({ ...d, [khoa]: gia_tri }));
  }

  async function guiForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDangGui(true);
    setLoi(null);

    const ketQua = dangSua
      ? await capNhatBaiViet(baiVietBanDau.duongDan, du_lieu)
      : await taoBaiViet(du_lieu); // ném redirect nếu thành công

    if (!ketQua.thanhCong) {
      setLoi(ketQua.loi);
      setDangGui(false);
      return;
    }
    setDangGui(false);
    router.refresh();
  }

  return (
    <form onSubmit={guiForm} className="form-cay">
      {loi && (
        <div className="bao bao-loi" role="alert" style={{ marginBottom: 'var(--k4)' }}>
          <span aria-hidden="true">⚠</span>
          <span>{loi}</span>
        </div>
      )}

      <fieldset className="khoi-form">
        <legend>Bài viết</legend>
        <div className="luoi-form">
          <div className="truong">
            <label htmlFor="tieuDe">Tiêu đề</label>
            <input id="tieuDe" required value={du_lieu.tieuDe} onChange={(e) => capNhatTruong('tieuDe', e.target.value)} />
          </div>
          <div className="truong">
            <label htmlFor="duongDan">Đường dẫn (không dấu, gạch ngang)</label>
            <input
              id="duongDan"
              required
              disabled={dangSua}
              pattern="[a-z0-9-]+"
              placeholder="ve-cham-xanh"
              value={du_lieu.duongDan}
              onChange={(e) => capNhatTruong('duongDan', e.target.value.toLowerCase())}
            />
            {dangSua && <span className="goi-y">Không đổi được sau khi tạo, để không vỡ liên kết đã chia sẻ.</span>}
          </div>
          <div className="truong" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="tomTat">Tóm tắt</label>
            <input id="tomTat" value={du_lieu.tomTat} onChange={(e) => capNhatTruong('tomTat', e.target.value)} />
          </div>
          <div className="truong" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="noiDung">Nội dung</label>
            <textarea id="noiDung" required rows={10} value={du_lieu.noiDung} onChange={(e) => capNhatTruong('noiDung', e.target.value)} />
          </div>
          <div className="truong">
            <label htmlFor="hinhAnh">URL hình ảnh</label>
            <input id="hinhAnh" value={du_lieu.hinhAnh} onChange={(e) => capNhatTruong('hinhAnh', e.target.value)} />
          </div>
          <div className="nhom-lua-chon">
            <label className="lua-chon-don">
              <input type="checkbox" checked={du_lieu.daXuatBan} onChange={(e) => capNhatTruong('daXuatBan', e.target.checked)} />
              Xuất bản ngay
            </label>
          </div>
        </div>
      </fieldset>

      <div className="hang-nut-form">
        <button type="submit" className="nut nut-chinh" disabled={dangGui}>
          {dangGui ? 'Đang lưu…' : dangSua ? 'Lưu thay đổi' : 'Tạo bài viết'}
        </button>
      </div>
    </form>
  );
}
