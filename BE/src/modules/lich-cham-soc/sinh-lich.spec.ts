import {
  sinhLichChamSoc,
  tinhChuKyTuoi,
  xacDinhMua,
  type CayDeSinhLich,
  type NgoiCanh,
} from './sinh-lich';

const LUOI_HO: CayDeSinhLich = {
  ma: 'luoi-ho',
  chuKyTuoiMuaKho: 14,
  chuKyTuoiMuaMua: 21,
  chuKyBonPhan: 60,
  chuKyThayDat: 24,
  canPhunSuong: false,
  doSauKiemTraDat: 3,
};

const LAN_Y: CayDeSinhLich = {
  ma: 'lan-y',
  chuKyTuoiMuaKho: 5,
  chuKyTuoiMuaMua: 7,
  chuKyBonPhan: 30,
  chuKyThayDat: 18,
  canPhunSuong: true,
  doSauKiemTraDat: 2,
};

const XA_LACH: CayDeSinhLich = {
  ma: 'xa-lach',
  chuKyTuoiMuaKho: 1,
  chuKyTuoiMuaMua: 2,
  chuKyBonPhan: 14,
  chuKyThayDat: null, // rau ăn lá không thay đất
  canPhunSuong: false,
  doSauKiemTraDat: 2,
};

const THANG_1 = new Date('2026-01-15T08:00:00');
const THANG_7 = new Date('2026-07-15T08:00:00');

function ngoiCanh(ghiDe: Partial<NgoiCanh> = {}): NgoiCanh {
  return { mien: 'Nam', noiDat: 'ban công có mái', moc: THANG_1, ...ghiDe };
}

// ============================================================
describe('Xác định mùa theo miền', () => {
  it('miền Nam tháng 7 là mùa mưa', () => {
    expect(xacDinhMua('Nam', THANG_7)).toBe('mưa');
  });

  it('miền Nam tháng 1 là mùa khô', () => {
    expect(xacDinhMua('Nam', THANG_1)).toBe('khô');
  });

  it('miền Trung theo cùng lịch mùa với miền Nam', () => {
    expect(xacDinhMua('Trung', THANG_7)).toBe('mưa');
    expect(xacDinhMua('Trung', THANG_1)).toBe('khô');
  });

  it('miền Bắc tháng 4 đã vào giai đoạn ẩm, khác miền Nam', () => {
    const thang4 = new Date('2026-04-15T08:00:00');
    expect(xacDinhMua('Bắc', thang4)).toBe('mưa');
    expect(xacDinhMua('Nam', thang4)).toBe('khô');
  });

  it('miền Bắc tháng 10 đã hanh khô, khác miền Nam', () => {
    const thang10 = new Date('2026-10-15T08:00:00');
    expect(xacDinhMua('Bắc', thang10)).toBe('khô');
    expect(xacDinhMua('Nam', thang10)).toBe('mưa');
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])('tháng %i luôn ra một mùa hợp lệ', (thang) => {
    const ngay = new Date(2026, thang - 1, 15);
    expect(['khô', 'mưa']).toContain(xacDinhMua('Bắc', ngay));
    expect(['khô', 'mưa']).toContain(xacDinhMua('Nam', ngay));
  });
});

// ============================================================
describe('Chu kỳ tưới điều chỉnh theo mùa và nơi đặt', () => {
  it('mùa mưa tưới thưa hơn mùa khô', () => {
    const khô = tinhChuKyTuoi(LUOI_HO, ngoiCanh({ moc: THANG_1 }));
    const mưa = tinhChuKyTuoi(LUOI_HO, ngoiCanh({ moc: THANG_7 }));
    expect(mưa).toBeGreaterThan(khô);
  });

  it('trong phòng máy lạnh tưới thưa hơn ban công trống', () => {
    const trongNha = tinhChuKyTuoi(LUOI_HO, ngoiCanh({ noiDat: 'trong nhà thiếu sáng' }));
    const banCong = tinhChuKyTuoi(LUOI_HO, ngoiCanh({ noiDat: 'ban công trống' }));
    expect(trongNha).toBeGreaterThan(banCong);
  });

  it('sân thượng là nơi phải tưới dày nhất', () => {
    const cacNoi = (
      ['trong nhà thiếu sáng', 'gần cửa sổ', 'ban công có mái', 'ban công trống', 'sân thượng'] as const
    ).map((noiDat) => tinhChuKyTuoi(LUOI_HO, ngoiCanh({ noiDat })));

    expect(Math.min(...cacNoi)).toBe(cacNoi[4]);
  });

  it('không bao giờ xuống dưới 1 ngày, kể cả cây tưới hằng ngày ở sân thượng', () => {
    const chuKy = tinhChuKyTuoi(XA_LACH, ngoiCanh({ noiDat: 'sân thượng', moc: THANG_1 }));
    expect(chuKy).toBeGreaterThanOrEqual(1);
  });

  it('miền Bắc và miền Nam cùng tháng 4 cho chu kỳ khác nhau', () => {
    const thang4 = new Date('2026-04-15T08:00:00');
    const bac = tinhChuKyTuoi(LUOI_HO, ngoiCanh({ mien: 'Bắc', moc: thang4 }));
    const nam = tinhChuKyTuoi(LUOI_HO, ngoiCanh({ mien: 'Nam', moc: thang4 }));
    expect(bac).not.toBe(nam);
  });
});

// ============================================================
describe('Sinh lịch chăm sóc', () => {
  it('cây nào cũng có việc tưới', () => {
    const viec = sinhLichChamSoc(LUOI_HO, ngoiCanh());
    expect(viec.some((v) => v.loai === 'tưới')).toBe(true);
  });

  it('bốn loại việc là bốn dòng lịch riêng, không gộp', () => {
    const viec = sinhLichChamSoc(LAN_Y, ngoiCanh());
    expect(viec.map((v) => v.loai).sort()).toEqual(
      ['bón phân', 'phun sương', 'thay đất', 'tưới'].sort(),
    );
  });

  it('không sinh việc phun sương cho cây không cần', () => {
    const viec = sinhLichChamSoc(LUOI_HO, ngoiCanh());
    expect(viec.some((v) => v.loai === 'phun sương')).toBe(false);
  });

  it('không sinh việc thay đất cho rau ăn lá', () => {
    const viec = sinhLichChamSoc(XA_LACH, ngoiCanh());
    expect(viec.some((v) => v.loai === 'thay đất')).toBe(false);
  });

  it('hướng dẫn tưới nêu đúng độ sâu kiểm tra đất của loài đó', () => {
    const tuoiLuoiHo = sinhLichChamSoc(LUOI_HO, ngoiCanh()).find((v) => v.loai === 'tưới');
    const tuoiLanY = sinhLichChamSoc(LAN_Y, ngoiCanh()).find((v) => v.loai === 'tưới');

    expect(tuoiLuoiHo?.huongDan).toContain('3cm');
    expect(tuoiLanY?.huongDan).toContain('2cm');
  });

  it('mọi hạn đầu tiên đều nằm sau thời điểm mốc', () => {
    const moc = THANG_1;
    const viec = sinhLichChamSoc(LAN_Y, ngoiCanh({ moc }));
    expect(viec.every((v) => v.hanDauTien.getTime() > moc.getTime())).toBe(true);
  });

  it('chu kỳ thay đất tính bằng tháng, quy ra ngày', () => {
    const thayDat = sinhLichChamSoc(LUOI_HO, ngoiCanh()).find((v) => v.loai === 'thay đất');
    expect(thayDat?.chuKyNgay).toBe(24 * 30);
  });

  it('phun sương dày hơn tưới nhưng không dày hơn 2 ngày một lần', () => {
    const viec = sinhLichChamSoc(LAN_Y, ngoiCanh());
    const tuoi = viec.find((v) => v.loai === 'tưới')!;
    const phun = viec.find((v) => v.loai === 'phun sương')!;

    expect(phun.chuKyNgay).toBeLessThanOrEqual(tuoi.chuKyNgay);
    expect(phun.chuKyNgay).toBeGreaterThanOrEqual(2);
  });

  it('mọi chu kỳ đều là số nguyên dương', () => {
    const viec = sinhLichChamSoc(LAN_Y, ngoiCanh({ noiDat: 'sân thượng' }));
    expect(viec.every((v) => Number.isInteger(v.chuKyNgay) && v.chuKyNgay > 0)).toBe(true);
  });

  it('không làm thay đổi đối tượng cây truyền vào', () => {
    const banSao = { ...LUOI_HO };
    sinhLichChamSoc(LUOI_HO, ngoiCanh());
    expect(LUOI_HO).toEqual(banSao);
  });

  it('không làm thay đổi ngày mốc truyền vào', () => {
    const moc = new Date('2026-01-15T08:00:00');
    const truoc = moc.getTime();
    sinhLichChamSoc(LAN_Y, ngoiCanh({ moc }));
    expect(moc.getTime()).toBe(truoc);
  });
});
