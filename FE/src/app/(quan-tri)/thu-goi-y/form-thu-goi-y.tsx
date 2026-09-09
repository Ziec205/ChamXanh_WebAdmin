'use client';

import { useState, type FormEvent } from 'react';
import {
  CONG_DUNG,
  DIEN_TICH,
  HUONG,
  KINH_NGHIEM,
  MENH,
  MIEN,
  NOI_DAT,
  THOI_GIAN_RANH,
} from '@/lib/hang-so';
import { xinGoiY, type CauTraLoiKhaoSat, type KetQuaGoiYDayDu } from './actions';

const MAC_DINH: CauTraLoiKhaoSat = {
  noiDat: NOI_DAT[1], // gần cửa sổ
  huong: HUONG[2], // Nam
  dienTich: DIEN_TICH[1], // 1-3m²
  kinhNghiem: KINH_NGHIEM[1], // mới bắt đầu
  thoiGianRanh: THOI_GIAN_RANH[1], // vài phút mỗi ngày
  coThuNuoi: false,
  mien: MIEN[2], // Nam
  mucDich: [],
  menh: '',
  soLuong: 6,
};

const TEN_TRONG_SO: Record<keyof KetQuaGoiYDayDu['trongSoDaDung'], string> = {
  anhSang: 'Ánh sáng',
  thoiGian: 'Thời gian rảnh',
  kinhNghiem: 'Kinh nghiệm',
  dienTich: 'Diện tích',
  mucDich: 'Mục đích',
  phongThuy: 'Phong thuỷ',
};

export default function FormThuGoiY() {
  const [traLoi, setTraLoi] = useState<CauTraLoiKhaoSat>(MAC_DINH);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const [ketQua, setKetQua] = useState<KetQuaGoiYDayDu | null>(null);

  function doiMucDich(gia_tri: (typeof CONG_DUNG)[number]) {
    setTraLoi((t) => ({
      ...t,
      mucDich: t.mucDich.includes(gia_tri)
        ? t.mucDich.filter((m) => m !== gia_tri)
        : [...t.mucDich, gia_tri],
    }));
  }

  async function guiForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDangGui(true);
    setLoi(null);

    const ketQuaHanhDong = await xinGoiY(traLoi);

    if (ketQuaHanhDong.thanhCong) {
      setKetQua(ketQuaHanhDong.duLieu);
    } else {
      setLoi(ketQuaHanhDong.loi);
      setKetQua(null);
    }
    setDangGui(false);
  }

  return (
    <>
      <form onSubmit={guiForm} className="the form-thu-goi-y">
        <div className="luoi-form">
          <div className="truong">
            <label htmlFor="noiDat">Nơi đặt cây</label>
            <select
              id="noiDat"
              value={traLoi.noiDat}
              onChange={(e) => setTraLoi((t) => ({ ...t, noiDat: e.target.value as CauTraLoiKhaoSat['noiDat'] }))}
            >
              {NOI_DAT.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="truong">
            <label htmlFor="huong">Hướng</label>
            <select
              id="huong"
              value={traLoi.huong}
              onChange={(e) => setTraLoi((t) => ({ ...t, huong: e.target.value as CauTraLoiKhaoSat['huong'] }))}
            >
              {HUONG.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="truong">
            <label htmlFor="dienTich">Diện tích</label>
            <select
              id="dienTich"
              value={traLoi.dienTich}
              onChange={(e) =>
                setTraLoi((t) => ({ ...t, dienTich: e.target.value as CauTraLoiKhaoSat['dienTich'] }))
              }
            >
              {DIEN_TICH.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="truong">
            <label htmlFor="kinhNghiem">Kinh nghiệm</label>
            <select
              id="kinhNghiem"
              value={traLoi.kinhNghiem}
              onChange={(e) =>
                setTraLoi((t) => ({ ...t, kinhNghiem: e.target.value as CauTraLoiKhaoSat['kinhNghiem'] }))
              }
            >
              {KINH_NGHIEM.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="truong">
            <label htmlFor="thoiGianRanh">Thời gian rảnh mỗi ngày</label>
            <select
              id="thoiGianRanh"
              value={traLoi.thoiGianRanh}
              onChange={(e) =>
                setTraLoi((t) => ({
                  ...t,
                  thoiGianRanh: e.target.value as CauTraLoiKhaoSat['thoiGianRanh'],
                }))
              }
            >
              {THOI_GIAN_RANH.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="truong">
            <label htmlFor="mien">Miền đang sống</label>
            <select
              id="mien"
              value={traLoi.mien}
              onChange={(e) => setTraLoi((t) => ({ ...t, mien: e.target.value as CauTraLoiKhaoSat['mien'] }))}
            >
              {MIEN.map((v) => (
                <option key={v} value={v}>
                  Miền {v}
                </option>
              ))}
            </select>
          </div>

          <div className="truong">
            <label htmlFor="menh">Mệnh (không bắt buộc)</label>
            <select
              id="menh"
              value={traLoi.menh}
              onChange={(e) => setTraLoi((t) => ({ ...t, menh: e.target.value as CauTraLoiKhaoSat['menh'] }))}
            >
              <option value="">Không chọn</option>
              {MENH.map((v) => (
                <option key={v} value={v}>
                  Mệnh {v}
                </option>
              ))}
            </select>
          </div>

          <div className="truong">
            <label htmlFor="soLuong">Số lượng gợi ý</label>
            <input
              id="soLuong"
              type="number"
              min={1}
              max={20}
              value={traLoi.soLuong}
              onChange={(e) =>
                setTraLoi((t) => ({ ...t, soLuong: Math.min(20, Math.max(1, Number(e.target.value) || 1)) }))
              }
            />
          </div>
        </div>

        <fieldset className="nhom-lua-chon">
          <legend>Nhà có nuôi chó hoặc mèo không?</legend>
          <label className="lua-chon-don">
            <input
              type="radio"
              name="coThuNuoi"
              checked={traLoi.coThuNuoi === false}
              onChange={() => setTraLoi((t) => ({ ...t, coThuNuoi: false }))}
            />
            Không
          </label>
          <label className="lua-chon-don">
            <input
              type="radio"
              name="coThuNuoi"
              checked={traLoi.coThuNuoi === true}
              onChange={() => setTraLoi((t) => ({ ...t, coThuNuoi: true }))}
            />
            Có
          </label>
        </fieldset>

        <fieldset className="nhom-lua-chon">
          <legend>Mục đích trồng cây (không bắt buộc, chọn được nhiều)</legend>
          {CONG_DUNG.map((v) => (
            <label key={v} className="lua-chon-don">
              <input
                type="checkbox"
                checked={traLoi.mucDich.includes(v)}
                onChange={() => doiMucDich(v)}
              />
              {v}
            </label>
          ))}
        </fieldset>

        {loi && (
          <div className="bao bao-loi" role="alert">
            <span aria-hidden="true">⚠</span>
            <span>{loi}</span>
          </div>
        )}

        <button type="submit" className="nut nut-chinh" disabled={dangGui}>
          {dangGui ? 'Đang tính…' : 'Xem gợi ý'}
        </button>
      </form>

      {ketQua && <KetQuaGoiY ketQua={ketQua} />}
    </>
  );
}

function KetQuaGoiY({ ketQua }: { ketQua: KetQuaGoiYDayDu }) {
  return (
    <div className="ket-qua-goi-y">
      <div className="the tom-tat-goi-y">
        <div>
          <p className="nhan">Mức sáng suy ra</p>
          <p className="gia-tri-noi-bat">{ketQua.anhSangCoSan}</p>
        </div>
        <div>
          <p className="nhan">Xét trên</p>
          <p className="gia-tri-noi-bat">{ketQua.tongSoLoaiXet} loài</p>
        </div>
        <div className="trong-so-da-dung">
          <p className="nhan">Trọng số đã dùng</p>
          <div className="danh-sach-trong-so">
            {(Object.keys(TEN_TRONG_SO) as (keyof typeof TEN_TRONG_SO)[]).map((k) => (
              <span key={k} className="chip-trong-so">
                {TEN_TRONG_SO[k]}: {ketQua.trongSoDaDung[k]}
              </span>
            ))}
          </div>
        </div>
      </div>

      <h2 className="tieu-de-ket-qua">Gợi ý ({ketQua.goiY.length})</h2>
      {ketQua.goiY.length === 0 ? (
        <div className="the rong">
          <strong>Không có loài nào phù hợp</strong>
          Thử nới lỏng điều kiện, hoặc kiểm tra xem đã có đủ dữ liệu cây chưa.
        </div>
      ) : (
        <div className="luoi-the-cay">
          {ketQua.goiY.map((cay, chiSo) => (
            <div key={cay.ma} className="the the-cay-goi-y">
              <div className="dau-the-cay">
                <span className="thu-hang">#{chiSo + 1}</span>
                <span className="diem-so">{cay.diem} điểm</span>
              </div>
              <h3>{cay.tenVi}</h3>
              <p className="giai-thich-cay">{cay.giaiThich}</p>
              {cay.lyDo.length > 0 && (
                <ul className="danh-sach-ly-do">
                  {cay.lyDo.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {ketQua.biLoai.length > 0 && (
        <>
          <h2 className="tieu-de-ket-qua">Bị loại ({ketQua.biLoai.length})</h2>
          <div className="bang-cuon">
            <table>
              <caption className="an-nhin">Danh sách loài cây bị loại và lý do</caption>
              <thead>
                <tr>
                  <th scope="col">Tên</th>
                  <th scope="col">Lý do loại</th>
                </tr>
              </thead>
              <tbody>
                {ketQua.biLoai.map((cay) => (
                  <tr key={cay.ma}>
                    <td>{cay.tenVi}</td>
                    <td>
                      <span className="chip chip-canh-bao">{cay.lyDoLoai}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
