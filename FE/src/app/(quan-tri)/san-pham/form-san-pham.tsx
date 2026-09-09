'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { NHOM_SAN_PHAM, NHAN_NHOM_SAN_PHAM } from '@/lib/hang-so';
import { SAN_PHAM_RONG, type DuLieuSanPham } from './kieu';
import { taoSanPham, capNhatSanPham } from './actions';

interface Props {
  sanPhamBanDau: (DuLieuSanPham & { _id: string }) | null;
}

export default function FormSanPham({ sanPhamBanDau }: Props) {
  const router = useRouter();
  const dangSua = sanPhamBanDau !== null;
  const [du_lieu, setDuLieu] = useState<DuLieuSanPham>(sanPhamBanDau ?? SAN_PHAM_RONG);
  const [hinhAnhChuoi, setHinhAnhChuoi] = useState(du_lieu.hinhAnh.join(', '));
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  function capNhatTruong<K extends keyof DuLieuSanPham>(khoa: K, gia_tri: DuLieuSanPham[K]) {
    setDuLieu((d) => ({ ...d, [khoa]: gia_tri }));
  }

  async function guiForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDangGui(true);
    setLoi(null);

    const du_lieu_gui: DuLieuSanPham = {
      ...du_lieu,
      hinhAnh: hinhAnhChuoi.split(',').map((h) => h.trim()).filter(Boolean),
    };

    const ketQua = dangSua
      ? await capNhatSanPham(sanPhamBanDau._id, du_lieu_gui)
      : await taoSanPham(du_lieu_gui);

    if (!ketQua.thanhCong) {
      setLoi(ketQua.loi);
      setDangGui(false);
      return;
    }
    setDangGui(false);
    router.push('/san-pham');
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
        <legend>Thông tin sản phẩm</legend>
        <div className="luoi-form">
          <div className="truong">
            <label htmlFor="ten">Tên sản phẩm</label>
            <input id="ten" required value={du_lieu.ten} onChange={(e) => capNhatTruong('ten', e.target.value)} />
          </div>
          <div className="truong">
            <label htmlFor="nhom">Nhóm</label>
            <select id="nhom" value={du_lieu.nhom} onChange={(e) => capNhatTruong('nhom', e.target.value as DuLieuSanPham['nhom'])}>
              {NHOM_SAN_PHAM.map((n) => (
                <option key={n} value={n}>
                  {NHAN_NHOM_SAN_PHAM[n]}
                </option>
              ))}
            </select>
          </div>
          <div className="truong">
            <label htmlFor="gia">Giá (đồng)</label>
            <input
              id="gia"
              type="number"
              min={0}
              required
              value={du_lieu.gia}
              onChange={(e) => capNhatTruong('gia', Number(e.target.value))}
            />
          </div>
          <div className="truong">
            <label htmlFor="tonKho">Tồn kho</label>
            <input
              id="tonKho"
              type="number"
              min={0}
              value={du_lieu.tonKho}
              onChange={(e) => capNhatTruong('tonKho', Number(e.target.value))}
            />
          </div>
          <div className="truong" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="moTa">Mô tả</label>
            <textarea id="moTa" rows={4} value={du_lieu.moTa} onChange={(e) => capNhatTruong('moTa', e.target.value)} />
          </div>
          <div className="truong" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="hinhAnh">URL hình ảnh (cách nhau bởi dấu phẩy)</label>
            <input id="hinhAnh" value={hinhAnhChuoi} onChange={(e) => setHinhAnhChuoi(e.target.value)} />
          </div>
          <div className="nhom-lua-chon">
            <label className="lua-chon-don">
              <input type="checkbox" checked={du_lieu.dangBan} onChange={(e) => capNhatTruong('dangBan', e.target.checked)} />
              Đang bán
            </label>
          </div>
        </div>
      </fieldset>

      <div className="hang-nut-form">
        <button type="submit" className="nut nut-chinh" disabled={dangGui}>
          {dangGui ? 'Đang lưu…' : dangSua ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
        </button>
      </div>
    </form>
  );
}
