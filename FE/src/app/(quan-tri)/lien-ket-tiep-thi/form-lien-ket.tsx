'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { SAN_THUONG_MAI, NHAN_SAN } from '@/lib/hang-so';
import { LIEN_KET_RONG, type DuLieuLienKet } from './kieu';
import { taoLienKet, capNhatLienKet } from './actions';

interface Props {
  /** null = tạo mới. */
  lienKetBanDau: (DuLieuLienKet & { _id: string }) | null;
}

export default function FormLienKet({ lienKetBanDau }: Props) {
  const router = useRouter();
  const dangSua = lienKetBanDau !== null;
  const [du_lieu, setDuLieu] = useState<DuLieuLienKet>(lienKetBanDau ?? LIEN_KET_RONG);
  const [tagsChuoi, setTagsChuoi] = useState(du_lieu.tags.join(', '));
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  function capNhatTruong<K extends keyof DuLieuLienKet>(khoa: K, gia_tri: DuLieuLienKet[K]) {
    setDuLieu((d) => ({ ...d, [khoa]: gia_tri }));
  }

  async function guiForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDangGui(true);
    setLoi(null);

    const du_lieu_gui: DuLieuLienKet = {
      ...du_lieu,
      tags: tagsChuoi
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const ketQua = dangSua
      ? await capNhatLienKet(lienKetBanDau._id, du_lieu_gui)
      : await taoLienKet(du_lieu_gui);

    if (!ketQua.thanhCong) {
      setLoi(ketQua.loi);
      setDangGui(false);
      return;
    }
    setDangGui(false);
    router.push('/lien-ket-tiep-thi');
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
        <legend>Thông tin liên kết</legend>
        <div className="luoi-form">
          <div className="truong">
            <label htmlFor="tieuDe">Tiêu đề</label>
            <input
              id="tieuDe"
              required
              value={du_lieu.tieuDe}
              onChange={(e) => capNhatTruong('tieuDe', e.target.value)}
            />
          </div>
          <div className="truong">
            <label htmlFor="san">Sàn</label>
            <select
              id="san"
              value={du_lieu.san}
              onChange={(e) => capNhatTruong('san', e.target.value as DuLieuLienKet['san'])}
            >
              {SAN_THUONG_MAI.map((s) => (
                <option key={s} value={s}>
                  {NHAN_SAN[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="truong" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="url">URL sản phẩm trên sàn</label>
            <input
              id="url"
              type="url"
              required
              placeholder="https://shopee.vn/..."
              value={du_lieu.url}
              onChange={(e) => capNhatTruong('url', e.target.value)}
            />
          </div>
          <div className="truong">
            <label htmlFor="hinhAnh">URL hình ảnh</label>
            <input id="hinhAnh" value={du_lieu.hinhAnh} onChange={(e) => capNhatTruong('hinhAnh', e.target.value)} />
          </div>
          <div className="truong">
            <label htmlFor="tags">Thẻ (cách nhau bởi dấu phẩy)</label>
            <input
              id="tags"
              placeholder="chau, su, mini"
              value={tagsChuoi}
              onChange={(e) => setTagsChuoi(e.target.value)}
            />
            <span className="goi-y">
              Trợ lý AI chỉ chọn thẻ, KHÔNG thấy URL — xem quyết định &quot;LLM không được thấy URL
              affiliate&quot;.
            </span>
          </div>
          <div className="truong" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="moTa">Mô tả</label>
            <textarea id="moTa" rows={3} value={du_lieu.moTa} onChange={(e) => capNhatTruong('moTa', e.target.value)} />
          </div>
          <div className="nhom-lua-chon">
            <label className="lua-chon-don">
              <input
                type="checkbox"
                checked={du_lieu.dangHienThi}
                onChange={(e) => capNhatTruong('dangHienThi', e.target.checked)}
              />
              Đang hiển thị
            </label>
          </div>
        </div>
      </fieldset>

      <div className="hang-nut-form">
        <button type="submit" className="nut nut-chinh" disabled={dangGui}>
          {dangGui ? 'Đang lưu…' : dangSua ? 'Lưu thay đổi' : 'Tạo liên kết'}
        </button>
      </div>
    </form>
  );
}
