import type { LoaiViec, Mien, Mua, NoiDat } from 'src/common/constants/cay-trong.const';

/** Phần dữ liệu cây mà bộ sinh lịch cần. */
export interface CayDeSinhLich {
  ma: string;
  chuKyTuoiMuaKho: number;
  chuKyTuoiMuaMua: number;
  chuKyBonPhan: number | null;
  chuKyThayDat: number | null;
  canPhunSuong: boolean;
  doSauKiemTraDat: number;
}

export interface NgoiCanh {
  mien: Mien;
  noiDat: NoiDat;
  /** Ngày làm mốc. Truyền vào để test không phụ thuộc đồng hồ hệ thống. */
  moc: Date;
}

export interface ViecChamSoc {
  loai: LoaiViec;
  chuKyNgay: number;
  hanDauTien: Date;
  huongDan: string;
}

/**
 * Xác định mùa theo miền.
 *
 * Miền Nam và miền Trung có mùa mưa rõ rệt từ tháng 5 đến tháng 11.
 * Miền Bắc bốn mùa, nhưng xét riêng nhu cầu nước thì tháng 4-9 là giai đoạn
 * nóng ẩm mưa nhiều, tháng 10-3 hanh khô — nên vẫn quy về hai mùa cho lịch tưới.
 */
export function xacDinhMua(mien: Mien, moc: Date): Mua {
  const thang = moc.getMonth() + 1;

  if (mien === 'Bắc') {
    return thang >= 4 && thang <= 9 ? 'mưa' : 'khô';
  }
  return thang >= 5 && thang <= 11 ? 'mưa' : 'khô';
}

/**
 * Nơi đặt cây làm thay đổi tốc độ bốc hơi nước.
 *
 * Trong phòng máy lạnh đất giữ ẩm lâu hơn nhiều so với ban công hứng nắng —
 * dùng chung một chu kỳ cho cả hai là cách nhanh nhất làm chết cây.
 */
const HE_SO_THEO_NOI_DAT: Record<NoiDat, number> = {
  'trong nhà thiếu sáng': 1.4,
  'gần cửa sổ': 1.15,
  'ban công có mái': 1.0,
  'ban công trống': 0.85,
  'sân thượng': 0.75,
};

function themNgay(moc: Date, soNgay: number): Date {
  const ketQua = new Date(moc);
  ketQua.setDate(ketQua.getDate() + soNgay);
  return ketQua;
}

/** Chu kỳ tưới thực tế, sau khi điều chỉnh theo mùa và nơi đặt. */
export function tinhChuKyTuoi(cay: CayDeSinhLich, ngoiCanh: NgoiCanh): number {
  const mua = xacDinhMua(ngoiCanh.mien, ngoiCanh.moc);
  const coBan = mua === 'khô' ? cay.chuKyTuoiMuaKho : cay.chuKyTuoiMuaMua;
  const dieuChinh = Math.round(coBan * HE_SO_THEO_NOI_DAT[ngoiCanh.noiDat]);

  // Không bao giờ để chu kỳ xuống dưới 1 ngày.
  return Math.max(1, dieuChinh);
}

/**
 * Sinh toàn bộ lịch chăm sóc cho một cây vừa được thêm vào vườn.
 *
 * Bốn loại việc là bốn dòng lịch riêng, không gộp thành một lời nhắc chung chung.
 * Việc nào cây không cần thì không sinh ra, thay vì sinh rồi để người dùng bỏ qua.
 */
export function sinhLichChamSoc(cay: CayDeSinhLich, ngoiCanh: NgoiCanh): ViecChamSoc[] {
  const viec: ViecChamSoc[] = [];

  const chuKyTuoi = tinhChuKyTuoi(cay, ngoiCanh);
  viec.push({
    loai: 'tưới',
    chuKyNgay: chuKyTuoi,
    hanDauTien: themNgay(ngoiCanh.moc, chuKyTuoi),
    huongDan: `Chạm ngón tay sâu ${cay.doSauKiemTraDat}cm vào đất, khô mới tưới.`,
  });

  if (cay.canPhunSuong) {
    // Phun sương dày hơn tưới nhưng không quá dày để thành việc vặt gây phiền.
    const chuKyPhun = Math.max(2, Math.round(chuKyTuoi / 2));
    viec.push({
      loai: 'phun sương',
      chuKyNgay: chuKyPhun,
      hanDauTien: themNgay(ngoiCanh.moc, chuKyPhun),
      huongDan: 'Phun sương lên mặt dưới lá vào buổi sáng, tránh phun lúc nắng gắt.',
    });
  }

  if (cay.chuKyBonPhan) {
    viec.push({
      loai: 'bón phân',
      chuKyNgay: cay.chuKyBonPhan,
      hanDauTien: themNgay(ngoiCanh.moc, cay.chuKyBonPhan),
      huongDan: 'Bón phân loãng khi đất còn ẩm, không bón lúc đất khô hoặc cây đang héo.',
    });
  }

  if (cay.chuKyThayDat) {
    const soNgay = cay.chuKyThayDat * 30;
    viec.push({
      loai: 'thay đất',
      chuKyNgay: soNgay,
      hanDauTien: themNgay(ngoiCanh.moc, soNgay),
      huongDan: 'Thay đất vào đầu mùa mưa, khi cây đang trong giai đoạn phát triển mạnh.',
    });
  }

  return viec;
}
