'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LOAI_KHAM_PHA, NHAN_LOAI_KHAM_PHA } from '@/lib/hang-so';
import { KHAM_PHA_RONG, type DuLieuKhamPha } from './kieu';
import { taoKhamPha, capNhatKhamPha } from './actions';

interface Props {
  khamPhaBanDau: (DuLieuKhamPha & { _id: string }) | null;
}

export default function FormKhamPha({ khamPhaBanDau }: Props) {
  const router = useRouter();
  const dangSua = khamPhaBanDau !== null;
  const [du_lieu, setDuLieu] = useState<DuLieuKhamPha>(khamPhaBanDau ?? KHAM_PHA_RONG);
  const [tagsChuoi, setTagsChuoi] = useState(du_lieu.tags.join(', '));
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  function capNhatTruong<K extends keyof DuLieuKhamPha>(khoa: K, gia_tri: DuLieuKhamPha[K]) {
    setDuLieu((d) => ({ ...d, [khoa]: gia_tri }));
  }

  async function guiForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDangGui(true);
    setLoi(null);

    const du_lieu_gui: DuLieuKhamPha = {
      ...du_lieu,
      tags: tagsChuoi.split(',').map((t) => t.trim()).filter(Boolean),
    };

    const ketQua = dangSua
      ? await capNhatKhamPha(khamPhaBanDau._id, du_lieu_gui)
      : await taoKhamPha(du_lieu_gui);

    if (!ketQua.thanhCong) {
      setLoi(ketQua.loi);
      setDangGui(false);
      return;
    }
    setDangGui(false);
    router.push('/kham-pha');
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
        <legend>Nội dung khám phá</legend>
        <div className="luoi-form">
          <div className="truong">
            <label htmlFor="tieuDe">Tiêu đề</label>
            <input id="tieuDe" required value={du_lieu.tieuDe} onChange={(e) => capNhatTruong('tieuDe', e.target.value)} />
          </div>
          <div className="truong">
            <label htmlFor="loai">Loại</label>
            <select id="loai" value={du_lieu.loai} onChange={(e) => capNhatTruong('loai', e.target.value as DuLieuKhamPha['loai'])}>
              {LOAI_KHAM_PHA.map((l) => (
                <option key={l} value={l}>
                  {NHAN_LOAI_KHAM_PHA[l]}
                </option>
              ))}
            </select>
          </div>
          <div className="truong" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="tomTat">Tóm tắt</label>
            <input id="tomTat" value={du_lieu.tomTat} onChange={(e) => capNhatTruong('tomTat', e.target.value)} />
          </div>
          <div className="truong" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="noiDung">Nội dung</label>
            <textarea id="noiDung" required rows={8} value={du_lieu.noiDung} onChange={(e) => capNhatTruong('noiDung', e.target.value)} />
          </div>
          <div className="truong">
            <label htmlFor="hinhAnh">URL hình ảnh</label>
            <input id="hinhAnh" value={du_lieu.hinhAnh} onChange={(e) => capNhatTruong('hinhAnh', e.target.value)} />
          </div>
          <div className="truong">
            <label htmlFor="tags">Thẻ (cách nhau bởi dấu phẩy)</label>
            <input id="tags" value={tagsChuoi} onChange={(e) => setTagsChuoi(e.target.value)} />
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
          {dangGui ? 'Đang lưu…' : dangSua ? 'Lưu thay đổi' : 'Tạo nội dung'}
        </button>
      </div>
    </form>
  );
}
