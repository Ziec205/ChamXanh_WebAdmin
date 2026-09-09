import {
  CHAU_TOI_DA_THEO_DIEN_TICH,
  CHU_KY_TUOI_TOI_THIEU_THEO_THOI_GIAN,
  DO_KHO_TOI_DA_THEO_KINH_NGHIEM,
  thangSang,
  type CongDung,
  type Menh,
  type MucSang,
} from 'src/common/constants/cay-trong.const';
import type { HoSoDacTinh } from './suy-ra-the';

/** Trọng số mặc định. Admin chỉnh được trong app_config mà không cần phát hành lại app. */
export interface TrongSo {
  anhSang: number;
  thoiGian: number;
  kinhNghiem: number;
  dienTich: number;
  mucDich: number;
  phongThuy: number;
}

export const TRONG_SO_MAC_DINH: TrongSo = {
  anhSang: 30,
  thoiGian: 20,
  kinhNghiem: 15,
  dienTich: 15,
  mucDich: 10,
  phongThuy: 10,
};

/** Phần dữ liệu cây mà bộ chấm điểm cần. Cố ý hẹp để test không phải dựng cả document. */
export interface CayDeChamDiem {
  ma: string;
  tenVi: string;
  anhSangToiThieu: MucSang;
  anhSangLyTuong: MucSang;
  chuKyTuoiMuaKho: number;
  chuKyTuoiMuaMua: number;
  doKho: number;
  kichThuocChauCm: number;
  anToanThuNuoi: boolean;
  congDung: CongDung[];
  menhPhongThuy: Menh | null;
}

export type LyDoLoai = 'độc với thú nuôi' | 'thiếu sáng' | 'quá to so với không gian';

export interface KetQuaChamDiem {
  ma: string;
  tenVi: string;
  diem: number;
  lyDo: string[];
  giaiThich: string;
}

export interface CayBiLoai {
  ma: string;
  tenVi: string;
  lyDoLoai: LyDoLoai;
}

export interface KetQuaGoiY {
  goiY: KetQuaChamDiem[];
  biLoai: CayBiLoai[];
}

/**
 * Bộ lọc cứng: vướng một trong các điều kiện này thì loại thẳng,
 * bất kể điểm các tiêu chí khác cao đến đâu.
 *
 * Trả về lý do loại thay vì chỉ true/false, để Web Admin giải thích được
 * vì sao một loài không bao giờ xuất hiện trong gợi ý.
 */
export function kiemTraLocCung(cay: CayDeChamDiem, hoSo: HoSoDacTinh): LyDoLoai | null {
  // Nhà có chó mèo thì không bao giờ gợi ý cây độc. Đây là vấn đề an toàn, không phải sở thích.
  if (hoSo.coThuNuoi && !cay.anToanThuNuoi) return 'độc với thú nuôi';

  // Chỗ đặt tối hơn mức tối thiểu thì cây không sống nổi, gợi ý là hại người dùng.
  if (thangSang(hoSo.anhSangCoSan) < thangSang(cay.anhSangToiThieu)) return 'thiếu sáng';

  // Chậu trưởng thành không lọt không gian đã khai.
  if (cay.kichThuocChauCm > CHAU_TOI_DA_THEO_DIEN_TICH[hoSo.dienTich]) {
    return 'quá to so với không gian';
  }

  return null;
}

/** Điểm ánh sáng: đầy điểm khi trùng mức lý tưởng, trừ dần theo khoảng cách. */
function diemAnhSang(cay: CayDeChamDiem, hoSo: HoSoDacTinh, trongSo: number): number {
  const lech = Math.abs(thangSang(hoSo.anhSangCoSan) - thangSang(cay.anhSangLyTuong));
  // Lệch 0 bậc = 100%, 1 bậc = 65%, 2 bậc = 30%, 3 bậc = 0%.
  const tyLe = [1, 0.65, 0.3, 0][Math.min(lech, 3)];
  return trongSo * tyLe;
}

/**
 * Điểm thời gian: cây tưới càng thưa càng hợp người bận.
 * Dùng chu kỳ mùa khô vì đó là lúc phải tưới dày nhất — chọn theo trường hợp xấu nhất.
 */
function diemThoiGian(cay: CayDeChamDiem, hoSo: HoSoDacTinh, trongSo: number): number {
  const nguong = CHU_KY_TUOI_TOI_THIEU_THEO_THOI_GIAN[hoSo.thoiGianRanh];
  if (cay.chuKyTuoiMuaKho >= nguong) return trongSo;

  // Tưới dày hơn mức người dùng theo nổi — giảm điểm theo mức độ chênh.
  return trongSo * Math.max(0, cay.chuKyTuoiMuaKho / nguong);
}

/** Điểm kinh nghiệm: vượt trần độ khó thì mất điểm nhanh. */
function diemKinhNghiem(cay: CayDeChamDiem, hoSo: HoSoDacTinh, trongSo: number): number {
  const tran = DO_KHO_TOI_DA_THEO_KINH_NGHIEM[hoSo.kinhNghiem];
  if (cay.doKho <= tran) {
    // Trong tầm: cây càng dễ càng được ưu ái một chút.
    return trongSo * (1 - (cay.doKho - 1) * 0.05);
  }
  return trongSo * Math.max(0, 1 - (cay.doKho - tran) * 0.5);
}

/** Điểm diện tích: chậu càng dư chỗ càng thoải mái. */
function diemDienTich(cay: CayDeChamDiem, hoSo: HoSoDacTinh, trongSo: number): number {
  const toiDa = CHAU_TOI_DA_THEO_DIEN_TICH[hoSo.dienTich];
  if (toiDa >= 999) return trongSo;
  return trongSo * Math.max(0, Math.min(1, 1 - cay.kichThuocChauCm / toiDa + 0.35));
}

/** Điểm mục đích: tỷ lệ mục đích của người dùng mà cây đáp ứng được. */
function diemMucDich(cay: CayDeChamDiem, hoSo: HoSoDacTinh, trongSo: number): number {
  if (hoSo.mucDich.length === 0) return trongSo;
  const trung = hoSo.mucDich.filter((m) => cay.congDung.includes(m)).length;
  return trongSo * (trung / hoSo.mucDich.length);
}

/** Điểm phong thuỷ: cộng đủ khi hợp mệnh. Không khai mệnh thì không ai bị thiệt. */
function diemPhongThuy(cay: CayDeChamDiem, hoSo: HoSoDacTinh, trongSo: number): number {
  if (!hoSo.menh) return trongSo;
  return cay.menhPhongThuy === hoSo.menh ? trongSo : 0;
}

/** Ghép câu giải thích từ chính những tiêu chí đã thật sự cộng điểm cao. */
function ghepGiaiThich(lyDo: string[]): string {
  if (lyDo.length === 0) return 'Phù hợp ở mức cơ bản với điều kiện bạn mô tả.';
  if (lyDo.length === 1) return `Hợp vì ${lyDo[0]}.`;
  return `Hợp vì ${lyDo.slice(0, -1).join(', ')} và ${lyDo[lyDo.length - 1]}.`;
}

/** Chấm điểm một loài. Giả định đã qua bộ lọc cứng. */
export function chamDiemMotCay(
  cay: CayDeChamDiem,
  hoSo: HoSoDacTinh,
  trongSo: TrongSo = TRONG_SO_MAC_DINH,
): KetQuaChamDiem {
  const anhSang = diemAnhSang(cay, hoSo, trongSo.anhSang);
  const thoiGian = diemThoiGian(cay, hoSo, trongSo.thoiGian);
  const kinhNghiem = diemKinhNghiem(cay, hoSo, trongSo.kinhNghiem);
  const dienTich = diemDienTich(cay, hoSo, trongSo.dienTich);
  const mucDich = diemMucDich(cay, hoSo, trongSo.mucDich);
  const phongThuy = diemPhongThuy(cay, hoSo, trongSo.phongThuy);

  const lyDo: string[] = [];

  // Chỉ nêu lý do khi tiêu chí đó thật sự đạt gần trọn điểm —
  // câu giải thích phải đúng với phép tính, không phải lời quảng cáo.
  if (anhSang >= trongSo.anhSang * 0.9) {
    lyDo.push(`hợp với mức sáng ${hoSo.anhSangCoSan} ở chỗ bạn đặt`);
  }
  if (thoiGian >= trongSo.thoiGian * 0.9) {
    lyDo.push(`chỉ cần tưới ${cay.chuKyTuoiMuaKho} ngày một lần`);
  }
  if (kinhNghiem >= trongSo.kinhNghiem * 0.9 && cay.doKho <= 2) {
    lyDo.push('rất dễ chăm');
  }
  if (hoSo.coThuNuoi && cay.anToanThuNuoi) {
    lyDo.push('an toàn với chó mèo');
  }
  if (mucDich >= trongSo.mucDich * 0.9 && hoSo.mucDich.length > 0) {
    lyDo.push(`đáp ứng mục đích ${hoSo.mucDich.join(' và ')}`);
  }
  if (hoSo.menh && cay.menhPhongThuy === hoSo.menh) {
    lyDo.push(`hợp mệnh ${hoSo.menh}`);
  }

  const diem = anhSang + thoiGian + kinhNghiem + dienTich + mucDich + phongThuy;

  return {
    ma: cay.ma,
    tenVi: cay.tenVi,
    diem: Math.round(diem * 10) / 10,
    lyDo,
    giaiThich: ghepGiaiThich(lyDo),
  };
}

/**
 * Chấm điểm cả danh mục rồi trả về những loài hợp nhất.
 *
 * Trả kèm danh sách bị loại và lý do — Web Admin cần thấy được vì sao
 * một loài vừa nhập vào lại không bao giờ xuất hiện trong gợi ý.
 */
export function goiYCay(
  danhMuc: CayDeChamDiem[],
  hoSo: HoSoDacTinh,
  soLuong = 6,
  trongSo: TrongSo = TRONG_SO_MAC_DINH,
): KetQuaGoiY {
  const biLoai: CayBiLoai[] = [];
  const hopLe: CayDeChamDiem[] = [];

  for (const cay of danhMuc) {
    const lyDoLoai = kiemTraLocCung(cay, hoSo);
    if (lyDoLoai) {
      biLoai.push({ ma: cay.ma, tenVi: cay.tenVi, lyDoLoai });
    } else {
      hopLe.push(cay);
    }
  }

  const goiY = hopLe
    .map((cay) => chamDiemMotCay(cay, hoSo, trongSo))
    // Điểm bằng nhau thì xếp theo mã để kết quả ổn định giữa các lần gọi.
    .sort((a, b) => b.diem - a.diem || a.ma.localeCompare(b.ma))
    .slice(0, soLuong);

  return { goiY, biLoai };
}
