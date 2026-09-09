import {
  MUC_SANG,
  type DienTich,
  type Huong,
  type KinhNghiem,
  type Menh,
  type Mien,
  type MucSang,
  type NoiDat,
  type CongDung,
  type ThoiGianRanh,
} from 'src/common/constants/cay-trong.const';

/** Câu trả lời thô của người dùng trong khảo sát nhập môn. */
export interface CauTraLoiKhaoSat {
  noiDat: NoiDat;
  huong: Huong;
  dienTich: DienTich;
  kinhNghiem: KinhNghiem;
  thoiGianRanh: ThoiGianRanh;
  mucDich: CongDung[];
  coThuNuoi: boolean;
  mien: Mien;
  menh: Menh | null;
}

/** Hồ sơ đặc tính suy ra từ câu trả lời — đầu vào của bộ chấm điểm. */
export interface HoSoDacTinh {
  anhSangCoSan: MucSang;
  dienTich: DienTich;
  kinhNghiem: KinhNghiem;
  thoiGianRanh: ThoiGianRanh;
  mucDich: CongDung[];
  coThuNuoi: boolean;
  mien: Mien;
  menh: Menh | null;
}

/**
 * Điểm sáng cơ bản của từng vị trí đặt cây, theo thang MUC_SANG (0-3).
 * Đây là giá trị trước khi cộng trừ theo hướng.
 */
const SANG_CO_BAN: Record<NoiDat, number> = {
  'trong nhà thiếu sáng': 0,
  'gần cửa sổ': 1,
  'ban công có mái': 2,
  'ban công trống': 3,
  'sân thượng': 3,
};

/**
 * Hướng làm lệch lượng nắng thực nhận.
 *
 * Ở Việt Nam, hướng Tây và Nam nhận nắng gắt nhất trong ngày; hướng Bắc gần như
 * không có nắng trực tiếp; hướng Đông có nắng sớm dịu. Người dùng không biết
 * hướng thì không cộng trừ gì.
 */
const LECH_THEO_HUONG: Record<Huong, number> = {
  Tây: 0,
  Nam: 0,
  Đông: -1,
  Bắc: -2,
  'không rõ': 0,
};

/**
 * "Trong nhà thiếu sáng" là mô tả về chính lượng sáng, không phải về vị trí,
 * nên hướng cửa sổ không làm nó sáng hơn hay tối hơn.
 */
const KHONG_XET_HUONG: readonly NoiDat[] = ['trong nhà thiếu sáng'];

/**
 * Quy đổi vị trí đặt cây và hướng thành một mức sáng thực tế.
 *
 * Đây là bước quan trọng nhất của cả thuật toán: sai ở đây thì mọi gợi ý
 * phía sau đều sai, vì ánh sáng vừa là bộ lọc cứng vừa là tiêu chí nặng điểm nhất.
 */
export function suyRaAnhSang(noiDat: NoiDat, huong: Huong): MucSang {
  const coBan = SANG_CO_BAN[noiDat];
  const lech = KHONG_XET_HUONG.includes(noiDat) ? 0 : LECH_THEO_HUONG[huong];

  const diem = Math.min(MUC_SANG.length - 1, Math.max(0, coBan + lech));
  return MUC_SANG[diem];
}

/** Gói toàn bộ câu trả lời khảo sát thành hồ sơ đặc tính. */
export function suyRaHoSo(traLoi: CauTraLoiKhaoSat): HoSoDacTinh {
  return {
    anhSangCoSan: suyRaAnhSang(traLoi.noiDat, traLoi.huong),
    dienTich: traLoi.dienTich,
    kinhNghiem: traLoi.kinhNghiem,
    thoiGianRanh: traLoi.thoiGianRanh,
    mucDich: traLoi.mucDich,
    coThuNuoi: traLoi.coThuNuoi,
    mien: traLoi.mien,
    menh: traLoi.menh,
  };
}
