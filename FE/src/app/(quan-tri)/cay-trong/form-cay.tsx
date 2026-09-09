'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  CONG_DUNG,
  MENH,
  MUC_AM,
  MUC_SANG,
  NHOM_CAY,
} from '@/lib/hang-so';
import { CAY_RONG, type DuLieuCay, type MaCayLuaChon } from './kieu';
import { taoCay, capNhatCay } from './actions';

interface Props {
  /** null = tạo mới. Có giá trị = đang sửa, ma không cho đổi. */
  cayBanDau: DuLieuCay | null;
  /** Danh sách mã cây khác, dùng cho hai ô chọn trồng xen / không trồng cùng. */
  danhSachCay: MaCayLuaChon[];
}

export default function FormCay({ cayBanDau, danhSachCay }: Props) {
  const router = useRouter();
  const dangSua = cayBanDau !== null;
  const [du_lieu, setDuLieu] = useState<DuLieuCay>(cayBanDau ?? CAY_RONG);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  function capNhatTruong<K extends keyof DuLieuCay>(khoa: K, gia_tri: DuLieuCay[K]) {
    setDuLieu((d) => ({ ...d, [khoa]: gia_tri }));
  }

  function soHoacRong(chuoi: string): number | null {
    if (chuoi.trim() === '') return null;
    const n = Number(chuoi);
    return Number.isFinite(n) ? n : null;
  }

  function doiCongDung(gia_tri: (typeof CONG_DUNG)[number]) {
    setDuLieu((d) => ({
      ...d,
      congDung: d.congDung.includes(gia_tri)
        ? d.congDung.filter((c) => c !== gia_tri)
        : [...d.congDung, gia_tri],
    }));
  }

  function doiChonNhieu(khoa: 'trongXenDuocVoi' | 'khongTrongCungVoi', e: React.ChangeEvent<HTMLSelectElement>) {
    const chon = Array.from(e.target.selectedOptions).map((o) => o.value);
    capNhatTruong(khoa, chon);
  }

  function themDauHieuBenh() {
    setDuLieu((d) => ({
      ...d,
      dauHieuBenhThuongGap: [...d.dauHieuBenhThuongGap, { trieuChung: '', nguyenNhan: '', cachXuLy: '' }],
    }));
  }

  function xoaDauHieuBenh(chiSo: number) {
    setDuLieu((d) => ({
      ...d,
      dauHieuBenhThuongGap: d.dauHieuBenhThuongGap.filter((_, i) => i !== chiSo),
    }));
  }

  function suaDauHieuBenh(chiSo: number, truong: keyof DuLieuCay['dauHieuBenhThuongGap'][number], gia_tri: string) {
    setDuLieu((d) => ({
      ...d,
      dauHieuBenhThuongGap: d.dauHieuBenhThuongGap.map((dh, i) =>
        i === chiSo ? { ...dh, [truong]: gia_tri } : dh,
      ),
    }));
  }

  async function guiForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDangGui(true);
    setLoi(null);

    const ketQua = dangSua
      ? await capNhatCay(cayBanDau.ma, du_lieu)
      : await taoCay(du_lieu); // ném redirect nếu thành công, không rơi xuống dưới

    if (!ketQua.thanhCong) {
      setLoi(ketQua.loi);
      setDangGui(false);
      return;
    }

    setDangGui(false);
    router.refresh();
  }

  const chonDuocChoTrongXen = danhSachCay.filter((c) => c.ma !== du_lieu.ma);

  return (
    <form onSubmit={guiForm} className="form-cay">
      {loi && (
        <div className="bao bao-loi" role="alert" style={{ marginBottom: 'var(--k4)' }}>
          <span aria-hidden="true">⚠</span>
          <span>{loi}</span>
        </div>
      )}

      {/* ---- Định danh ---- */}
      <fieldset className="khoi-form">
        <legend>Định danh</legend>
        <div className="luoi-form">
          <div className="truong">
            <label htmlFor="ma">Mã (không dấu, gạch ngang)</label>
            <input
              id="ma"
              required
              disabled={dangSua}
              pattern="[a-z0-9-]+"
              placeholder="vi-du-luoi-ho"
              value={du_lieu.ma}
              onChange={(e) => capNhatTruong('ma', e.target.value.toLowerCase())}
            />
            {dangSua && <span className="goi-y">Không đổi được sau khi tạo.</span>}
          </div>
          <div className="truong">
            <label htmlFor="tenVi">Tên tiếng Việt</label>
            <input
              id="tenVi"
              required
              value={du_lieu.tenVi}
              onChange={(e) => capNhatTruong('tenVi', e.target.value)}
            />
          </div>
          <div className="truong">
            <label htmlFor="tenEn">Tên tiếng Anh</label>
            <input id="tenEn" value={du_lieu.tenEn} onChange={(e) => capNhatTruong('tenEn', e.target.value)} />
          </div>
          <div className="truong">
            <label htmlFor="tenKhoaHoc">Tên khoa học</label>
            <input
              id="tenKhoaHoc"
              value={du_lieu.tenKhoaHoc}
              onChange={(e) => capNhatTruong('tenKhoaHoc', e.target.value)}
            />
          </div>
          <div className="truong">
            <label htmlFor="nhom">Nhóm</label>
            <select id="nhom" value={du_lieu.nhom} onChange={(e) => capNhatTruong('nhom', e.target.value as DuLieuCay['nhom'])}>
              {NHOM_CAY.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* ---- Ánh sáng ---- */}
      <fieldset className="khoi-form">
        <legend>Ánh sáng</legend>
        <div className="luoi-form">
          <div className="truong">
            <label htmlFor="anhSangToiThieu">Tối thiểu</label>
            <select
              id="anhSangToiThieu"
              value={du_lieu.anhSangToiThieu}
              onChange={(e) => capNhatTruong('anhSangToiThieu', e.target.value as DuLieuCay['anhSangToiThieu'])}
            >
              {MUC_SANG.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="truong">
            <label htmlFor="anhSangLyTuong">Lý tưởng</label>
            <select
              id="anhSangLyTuong"
              value={du_lieu.anhSangLyTuong}
              onChange={(e) => capNhatTruong('anhSangLyTuong', e.target.value as DuLieuCay['anhSangLyTuong'])}
            >
              {MUC_SANG.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* ---- Tưới ---- */}
      <fieldset className="khoi-form">
        <legend>Tưới</legend>
        <div className="luoi-form">
          <div className="truong">
            <label htmlFor="chuKyTuoiMuaKho">Chu kỳ mùa khô (ngày)</label>
            <input
              id="chuKyTuoiMuaKho"
              type="number"
              min={1}
              max={60}
              required
              value={du_lieu.chuKyTuoiMuaKho}
              onChange={(e) => capNhatTruong('chuKyTuoiMuaKho', Number(e.target.value))}
            />
          </div>
          <div className="truong">
            <label htmlFor="chuKyTuoiMuaMua">Chu kỳ mùa mưa (ngày)</label>
            <input
              id="chuKyTuoiMuaMua"
              type="number"
              min={1}
              max={60}
              required
              value={du_lieu.chuKyTuoiMuaMua}
              onChange={(e) => capNhatTruong('chuKyTuoiMuaMua', Number(e.target.value))}
            />
          </div>
          <div className="truong">
            <label htmlFor="doSauKiemTraDat">Độ sâu kiểm tra đất (cm)</label>
            <input
              id="doSauKiemTraDat"
              type="number"
              min={1}
              max={10}
              value={du_lieu.doSauKiemTraDat}
              onChange={(e) => capNhatTruong('doSauKiemTraDat', Number(e.target.value))}
            />
          </div>
        </div>
      </fieldset>

      {/* ---- Chăm sóc khác ---- */}
      <fieldset className="khoi-form">
        <legend>Chăm sóc khác</legend>
        <div className="luoi-form">
          <div className="truong">
            <label htmlFor="chuKyBonPhan">Chu kỳ bón phân (ngày, để trống nếu không cần)</label>
            <input
              id="chuKyBonPhan"
              type="number"
              min={1}
              value={du_lieu.chuKyBonPhan ?? ''}
              onChange={(e) => capNhatTruong('chuKyBonPhan', soHoacRong(e.target.value))}
            />
          </div>
          <div className="truong">
            <label htmlFor="chuKyThayDat">Chu kỳ thay đất (tháng, để trống nếu không cần)</label>
            <input
              id="chuKyThayDat"
              type="number"
              min={1}
              value={du_lieu.chuKyThayDat ?? ''}
              onChange={(e) => capNhatTruong('chuKyThayDat', soHoacRong(e.target.value))}
            />
          </div>
        </div>
        <label className="lua-chon-don" style={{ marginTop: 'var(--k3)' }}>
          <input
            type="checkbox"
            checked={du_lieu.canPhunSuong}
            onChange={(e) => capNhatTruong('canPhunSuong', e.target.checked)}
          />
          Cần phun sương
        </label>
      </fieldset>

      {/* ---- Nhiệt độ & độ ẩm ---- */}
      <fieldset className="khoi-form">
        <legend>Nhiệt độ &amp; độ ẩm</legend>
        <div className="luoi-form">
          <div className="truong">
            <label htmlFor="nhietDoNgayMin">Nhiệt độ ngày — thấp nhất (°C)</label>
            <input
              id="nhietDoNgayMin"
              type="number"
              value={du_lieu.nhietDoNgayMin}
              onChange={(e) => capNhatTruong('nhietDoNgayMin', Number(e.target.value))}
            />
          </div>
          <div className="truong">
            <label htmlFor="nhietDoNgayMax">Nhiệt độ ngày — cao nhất (°C)</label>
            <input
              id="nhietDoNgayMax"
              type="number"
              value={du_lieu.nhietDoNgayMax}
              onChange={(e) => capNhatTruong('nhietDoNgayMax', Number(e.target.value))}
            />
          </div>
          <div className="truong">
            <label htmlFor="nhietDoDemMin">Nhiệt độ đêm — thấp nhất (°C)</label>
            <input
              id="nhietDoDemMin"
              type="number"
              value={du_lieu.nhietDoDemMin}
              onChange={(e) => capNhatTruong('nhietDoDemMin', Number(e.target.value))}
            />
          </div>
          <div className="truong">
            <label htmlFor="nhietDoDemMax">Nhiệt độ đêm — cao nhất (°C)</label>
            <input
              id="nhietDoDemMax"
              type="number"
              value={du_lieu.nhietDoDemMax}
              onChange={(e) => capNhatTruong('nhietDoDemMax', Number(e.target.value))}
            />
          </div>
          <div className="truong">
            <label htmlFor="doAm">Độ ẩm ưa thích</label>
            <select id="doAm" value={du_lieu.doAm} onChange={(e) => capNhatTruong('doAm', e.target.value as DuLieuCay['doAm'])}>
              {MUC_AM.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* ---- An toàn ---- */}
      <fieldset className="khoi-form">
        <legend>An toàn với thú nuôi</legend>
        <div className="nhom-lua-chon" style={{ border: 'none', padding: 0, margin: '0 0 var(--k4)' }}>
          <label className="lua-chon-don">
            <input
              type="radio"
              name="anToanThuNuoi"
              checked={du_lieu.anToanThuNuoi === true}
              onChange={() => capNhatTruong('anToanThuNuoi', true)}
            />
            An toàn
          </label>
          <label className="lua-chon-don">
            <input
              type="radio"
              name="anToanThuNuoi"
              checked={du_lieu.anToanThuNuoi === false}
              onChange={() => capNhatTruong('anToanThuNuoi', false)}
            />
            Có độc
          </label>
        </div>
        {!du_lieu.anToanThuNuoi && (
          <div className="truong">
            <label htmlFor="ghiChuDocTinh">Ghi chú độc tính</label>
            <input
              id="ghiChuDocTinh"
              placeholder="Ví dụ: độc nhẹ với chó mèo, gây nôn nếu ăn phải"
              value={du_lieu.ghiChuDocTinh}
              onChange={(e) => capNhatTruong('ghiChuDocTinh', e.target.value)}
            />
          </div>
        )}
      </fieldset>

      {/* ---- Độ khó & kích thước ---- */}
      <fieldset className="khoi-form">
        <legend>Độ khó &amp; kích thước</legend>
        <div className="luoi-form">
          <div className="truong">
            <label htmlFor="doKho">Độ khó (1 dễ nhất — 5 khó nhất)</label>
            <input
              id="doKho"
              type="number"
              min={1}
              max={5}
              required
              value={du_lieu.doKho}
              onChange={(e) => capNhatTruong('doKho', Number(e.target.value))}
            />
          </div>
          <div className="truong">
            <label htmlFor="kichThuocChauCm">Đường kính chậu trưởng thành (cm)</label>
            <input
              id="kichThuocChauCm"
              type="number"
              min={5}
              max={200}
              required
              value={du_lieu.kichThuocChauCm}
              onChange={(e) => capNhatTruong('kichThuocChauCm', Number(e.target.value))}
            />
          </div>
          <div className="truong">
            <label htmlFor="khoangCachTrongCm">Khoảng cách trồng (cm, để trống nếu không áp dụng)</label>
            <input
              id="khoangCachTrongCm"
              type="number"
              min={1}
              value={du_lieu.khoangCachTrongCm ?? ''}
              onChange={(e) => capNhatTruong('khoangCachTrongCm', soHoacRong(e.target.value))}
            />
          </div>
        </div>
      </fieldset>

      {/* ---- Phong thuỷ ---- */}
      <fieldset className="khoi-form">
        <legend>Phong thuỷ</legend>
        <div className="luoi-form">
          <div className="truong">
            <label htmlFor="menhPhongThuy">Mệnh (không bắt buộc)</label>
            <select
              id="menhPhongThuy"
              value={du_lieu.menhPhongThuy}
              onChange={(e) => capNhatTruong('menhPhongThuy', e.target.value as DuLieuCay['menhPhongThuy'])}
            >
              <option value="">Không chọn</option>
              {MENH.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="truong">
            <label htmlFor="yNghiaPhongThuy">Ý nghĩa</label>
            <input
              id="yNghiaPhongThuy"
              placeholder="Ví dụ: tài lộc, thịnh vượng"
              value={du_lieu.yNghiaPhongThuy}
              onChange={(e) => capNhatTruong('yNghiaPhongThuy', e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      {/* ---- Ăn được & trồng xen ---- */}
      <fieldset className="khoi-form">
        <legend>Ăn được &amp; trồng xen (chỉ áp dụng với nhóm rau, cây ăn quả)</legend>
        <div className="luoi-form">
          <div className="truong">
            <label htmlFor="ngayThuHoach">Ngày thu hoạch (để trống nếu là cây cảnh)</label>
            <input
              id="ngayThuHoach"
              type="number"
              min={1}
              value={du_lieu.ngayThuHoach ?? ''}
              onChange={(e) => capNhatTruong('ngayThuHoach', soHoacRong(e.target.value))}
            />
          </div>
        </div>
        <div className="luoi-form">
          <div className="truong">
            <label htmlFor="trongXenDuocVoi">Trồng xen được với</label>
            <select
              id="trongXenDuocVoi"
              multiple
              size={5}
              value={du_lieu.trongXenDuocVoi}
              onChange={(e) => doiChonNhieu('trongXenDuocVoi', e)}
            >
              {chonDuocChoTrongXen.map((c) => (
                <option key={c.ma} value={c.ma}>
                  {c.tenVi}
                </option>
              ))}
            </select>
            <span className="goi-y">Giữ Ctrl (hoặc Cmd) để chọn nhiều loài.</span>
          </div>
          <div className="truong">
            <label htmlFor="khongTrongCungVoi">Không nên trồng cùng</label>
            <select
              id="khongTrongCungVoi"
              multiple
              size={5}
              value={du_lieu.khongTrongCungVoi}
              onChange={(e) => doiChonNhieu('khongTrongCungVoi', e)}
            >
              {chonDuocChoTrongXen.map((c) => (
                <option key={c.ma} value={c.ma}>
                  {c.tenVi}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* ---- Công dụng ---- */}
      <fieldset className="khoi-form">
        <legend>Công dụng</legend>
        <div className="nhom-lua-chon" style={{ border: 'none', padding: 0, margin: 0 }}>
          {CONG_DUNG.map((v) => (
            <label key={v} className="lua-chon-don">
              <input type="checkbox" checked={du_lieu.congDung.includes(v)} onChange={() => doiCongDung(v)} />
              {v}
            </label>
          ))}
        </div>
      </fieldset>

      {/* ---- Nội dung hiển thị ---- */}
      <fieldset className="khoi-form">
        <legend>Nội dung hiển thị</legend>
        <div className="truong" style={{ marginBottom: 'var(--k4)' }}>
          <label htmlFor="moTaNgan">Mô tả ngắn</label>
          <textarea
            id="moTaNgan"
            rows={2}
            value={du_lieu.moTaNgan}
            onChange={(e) => capNhatTruong('moTaNgan', e.target.value)}
          />
        </div>
        <div className="truong" style={{ marginBottom: 'var(--k4)' }}>
          <label htmlFor="huongDanChamSoc">Hướng dẫn chăm sóc</label>
          <textarea
            id="huongDanChamSoc"
            rows={4}
            value={du_lieu.huongDanChamSoc}
            onChange={(e) => capNhatTruong('huongDanChamSoc', e.target.value)}
          />
        </div>
        <div className="truong">
          <label htmlFor="anhUrl">Đường dẫn ảnh</label>
          <input id="anhUrl" value={du_lieu.anhUrl} onChange={(e) => capNhatTruong('anhUrl', e.target.value)} />
          <span className="goi-y">Để trống lúc nhập tay — tải ảnh lên sẽ làm ở bản sau.</span>
        </div>
      </fieldset>

      {/* ---- Dấu hiệu bệnh ---- */}
      <fieldset className="khoi-form">
        <legend>Dấu hiệu bệnh thường gặp</legend>
        {du_lieu.dauHieuBenhThuongGap.length === 0 && (
          <p className="goi-y" style={{ marginBottom: 'var(--k3)' }}>
            Chưa có dấu hiệu bệnh nào — đây là nguồn cho chip triệu chứng của trợ lý AI.
          </p>
        )}
        {du_lieu.dauHieuBenhThuongGap.map((dh, chiSo) => (
          <div key={chiSo} className="dong-dau-hieu-benh">
            <div className="luoi-form">
              <div className="truong">
                <label htmlFor={`trieuChung-${chiSo}`}>Triệu chứng</label>
                <input
                  id={`trieuChung-${chiSo}`}
                  required
                  value={dh.trieuChung}
                  onChange={(e) => suaDauHieuBenh(chiSo, 'trieuChung', e.target.value)}
                />
              </div>
              <div className="truong">
                <label htmlFor={`nguyenNhan-${chiSo}`}>Nguyên nhân</label>
                <input
                  id={`nguyenNhan-${chiSo}`}
                  required
                  value={dh.nguyenNhan}
                  onChange={(e) => suaDauHieuBenh(chiSo, 'nguyenNhan', e.target.value)}
                />
              </div>
              <div className="truong">
                <label htmlFor={`cachXuLy-${chiSo}`}>Cách xử lý</label>
                <input
                  id={`cachXuLy-${chiSo}`}
                  required
                  value={dh.cachXuLy}
                  onChange={(e) => suaDauHieuBenh(chiSo, 'cachXuLy', e.target.value)}
                />
              </div>
            </div>
            <button
              type="button"
              className="nut nut-phu nut-xoa-dong"
              onClick={() => xoaDauHieuBenh(chiSo)}
              aria-label={`Xoá dấu hiệu bệnh thứ ${chiSo + 1}`}
            >
              Xoá
            </button>
          </div>
        ))}
        <button type="button" className="nut nut-phu" onClick={themDauHieuBenh}>
          + Thêm dấu hiệu bệnh
        </button>
      </fieldset>

      {/* ---- Trạng thái ---- */}
      <fieldset className="khoi-form">
        <legend>Trạng thái</legend>
        <div className="nhom-lua-chon" style={{ border: 'none', padding: 0, margin: 0 }}>
          <label className="lua-chon-don">
            <input
              type="checkbox"
              checked={du_lieu.daKiemChung}
              onChange={(e) => capNhatTruong('daKiemChung', e.target.checked)}
            />
            Đã kiểm chứng
          </label>
          <label className="lua-chon-don">
            <input
              type="checkbox"
              checked={du_lieu.dangHienThi}
              onChange={(e) => capNhatTruong('dangHienThi', e.target.checked)}
            />
            Đang hiển thị (xuất hiện trong gợi ý)
          </label>
        </div>
        {!du_lieu.daKiemChung && (
          <div className="bao bao-canh-bao" style={{ marginTop: 'var(--k3)' }}>
            <span aria-hidden="true">⚠</span>
            <span>Chưa kiểm chứng nghĩa là dữ liệu nháp — cần đối chiếu ít nhất hai nguồn trước khi bật.</span>
          </div>
        )}
      </fieldset>

      <div className="hang-nut-form">
        <button type="submit" className="nut nut-chinh" disabled={dangGui}>
          {dangGui ? 'Đang lưu…' : dangSua ? 'Lưu thay đổi' : 'Tạo loài cây'}
        </button>
        <button type="button" className="nut nut-phu" onClick={() => router.back()} disabled={dangGui}>
          Huỷ
        </button>
      </div>
    </form>
  );
}
