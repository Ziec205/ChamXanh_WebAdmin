import { goiYCay, kiemTraLocCung, chamDiemMotCay, type CayDeChamDiem } from './cham-diem';
import { suyRaAnhSang, type HoSoDacTinh } from './suy-ra-the';

// --- Danh mục rút gọn, lấy số liệu từ Document/du-lieu-cay-trong.xlsx ---

const LUOI_HO: CayDeChamDiem = {
  ma: 'luoi-ho',
  tenVi: 'Lưỡi hổ',
  anhSangToiThieu: 'bóng râm',
  anhSangLyTuong: 'sáng gián tiếp',
  chuKyTuoiMuaKho: 14,
  chuKyTuoiMuaMua: 21,
  doKho: 1,
  kichThuocChauCm: 20,
  anToanThuNuoi: false, // độc nhẹ với chó mèo
  congDung: ['lọc không khí', 'trang trí', 'phong thuỷ'],
  menhPhongThuy: 'Thổ',
};

const KIM_NGAN: CayDeChamDiem = {
  ma: 'kim-ngan',
  tenVi: 'Kim ngân',
  anhSangToiThieu: 'sáng gián tiếp',
  anhSangLyTuong: 'sáng gián tiếp',
  chuKyTuoiMuaKho: 7,
  chuKyTuoiMuaMua: 10,
  doKho: 2,
  kichThuocChauCm: 25,
  anToanThuNuoi: true,
  congDung: ['trang trí', 'phong thuỷ'],
  menhPhongThuy: 'Mộc',
};

const CAU_TIEU_TRAM: CayDeChamDiem = {
  ma: 'cau-tieu-tram',
  tenVi: 'Cau tiểu trâm',
  anhSangToiThieu: 'bóng râm',
  anhSangLyTuong: 'sáng gián tiếp',
  chuKyTuoiMuaKho: 5,
  chuKyTuoiMuaMua: 7,
  doKho: 2,
  kichThuocChauCm: 20,
  anToanThuNuoi: true,
  congDung: ['lọc không khí', 'trang trí'],
  menhPhongThuy: 'Mộc',
};

const CA_CHUA_BI: CayDeChamDiem = {
  ma: 'ca-chua-bi',
  tenVi: 'Cà chua bi',
  anhSangToiThieu: 'nắng trực tiếp',
  anhSangLyTuong: 'nắng trực tiếp',
  chuKyTuoiMuaKho: 2,
  chuKyTuoiMuaMua: 2,
  doKho: 4,
  kichThuocChauCm: 30,
  anToanThuNuoi: false, // lá và thân độc
  congDung: ['ăn được'],
  menhPhongThuy: null,
};

const HUNG_QUE: CayDeChamDiem = {
  ma: 'hung-que',
  tenVi: 'Húng quế',
  anhSangToiThieu: 'nắng bán phần',
  anhSangLyTuong: 'nắng trực tiếp',
  chuKyTuoiMuaKho: 2,
  chuKyTuoiMuaMua: 3,
  doKho: 2,
  kichThuocChauCm: 15,
  anToanThuNuoi: true,
  congDung: ['ăn được'],
  menhPhongThuy: null,
};

const BANG_SINGAPORE: CayDeChamDiem = {
  ma: 'bang-singapore',
  tenVi: 'Bàng Singapore',
  anhSangToiThieu: 'sáng gián tiếp',
  anhSangLyTuong: 'nắng bán phần',
  chuKyTuoiMuaKho: 7,
  chuKyTuoiMuaMua: 10,
  doKho: 4,
  kichThuocChauCm: 35,
  anToanThuNuoi: false,
  congDung: ['trang trí'],
  menhPhongThuy: 'Mộc',
};

const DANH_MUC = [LUOI_HO, KIM_NGAN, CAU_TIEU_TRAM, CA_CHUA_BI, HUNG_QUE, BANG_SINGAPORE];

function hoSo(ghiDe: Partial<HoSoDacTinh> = {}): HoSoDacTinh {
  return {
    anhSangCoSan: 'sáng gián tiếp',
    dienTich: '3-10m²',
    kinhNghiem: 'đã trồng vài cây',
    thoiGianRanh: '15-30 phút mỗi ngày',
    mucDich: [],
    coThuNuoi: false,
    mien: 'Nam',
    menh: null,
    ...ghiDe,
  };
}

// ============================================================
describe('Suy ra mức sáng từ vị trí và hướng', () => {
  it('ban công trống hướng Tây nhận nắng trực tiếp', () => {
    expect(suyRaAnhSang('ban công trống', 'Tây')).toBe('nắng trực tiếp');
  });

  it('ban công trống hướng Bắc chỉ còn sáng gián tiếp', () => {
    expect(suyRaAnhSang('ban công trống', 'Bắc')).toBe('sáng gián tiếp');
  });

  it('gần cửa sổ hướng Bắc là chỗ tối nhất trong các vị trí có cửa sổ', () => {
    expect(suyRaAnhSang('gần cửa sổ', 'Bắc')).toBe('bóng râm');
  });

  it('trong nhà thiếu sáng thì hướng không cứu được', () => {
    expect(suyRaAnhSang('trong nhà thiếu sáng', 'Nam')).toBe('bóng râm');
    expect(suyRaAnhSang('trong nhà thiếu sáng', 'Bắc')).toBe('bóng râm');
  });

  it('không bao giờ vượt ra ngoài thang bốn mức', () => {
    expect(suyRaAnhSang('sân thượng', 'Nam')).toBe('nắng trực tiếp');
    expect(suyRaAnhSang('gần cửa sổ', 'Bắc')).toBe('bóng râm');
  });
});

// ============================================================
describe('Bộ lọc cứng', () => {
  it('loại cây độc khi nhà có chó mèo', () => {
    expect(kiemTraLocCung(LUOI_HO, hoSo({ coThuNuoi: true }))).toBe('độc với thú nuôi');
  });

  it('vẫn cho qua cây độc khi nhà không nuôi thú', () => {
    expect(kiemTraLocCung(LUOI_HO, hoSo({ coThuNuoi: false }))).toBeNull();
  });

  it('loại cây cần nắng khi chỗ đặt quá tối', () => {
    expect(kiemTraLocCung(CA_CHUA_BI, hoSo({ anhSangCoSan: 'bóng râm' }))).toBe('thiếu sáng');
  });

  it('cho qua khi đủ sáng tối thiểu, dù chưa lý tưởng', () => {
    expect(kiemTraLocCung(BANG_SINGAPORE, hoSo({ anhSangCoSan: 'sáng gián tiếp' }))).toBeNull();
  });

  it('loại cây có chậu vượt không gian', () => {
    expect(kiemTraLocCung(BANG_SINGAPORE, hoSo({ dienTich: 'dưới 1m²' }))).toBe(
      'quá to so với không gian',
    );
  });

  it('an toàn thú nuôi được xét trước ánh sáng', () => {
    // Cà chua bi vừa độc vừa cần nắng; lý do trả về phải là an toàn.
    const ketQua = kiemTraLocCung(CA_CHUA_BI, hoSo({ coThuNuoi: true, anhSangCoSan: 'bóng râm' }));
    expect(ketQua).toBe('độc với thú nuôi');
  });
});

// ============================================================
describe('Trường hợp biên: nhà có mèo', () => {
  const nhaCoMeo = hoSo({ coThuNuoi: true });

  it('không loài độc nào lọt vào kết quả gợi ý', () => {
    const { goiY } = goiYCay(DANH_MUC, nhaCoMeo);
    const maDoc = [LUOI_HO.ma, CA_CHUA_BI.ma, BANG_SINGAPORE.ma];
    expect(goiY.every((g) => !maDoc.includes(g.ma))).toBe(true);
  });

  it('nêu rõ lý do loại cho từng loài bị bỏ', () => {
    const { biLoai } = goiYCay(DANH_MUC, nhaCoMeo);
    expect(biLoai.find((b) => b.ma === 'luoi-ho')?.lyDoLoai).toBe('độc với thú nuôi');
  });

  it('câu giải thích có nhắc tới an toàn với chó mèo', () => {
    const { goiY } = goiYCay(DANH_MUC, nhaCoMeo);
    expect(goiY[0].giaiThich).toContain('an toàn với chó mèo');
  });

  it('vẫn còn gợi ý được, không trả về danh sách rỗng', () => {
    const { goiY } = goiYCay(DANH_MUC, nhaCoMeo);
    expect(goiY.length).toBeGreaterThan(0);
  });
});

// ============================================================
describe('Trường hợp biên: ban công 2m² hướng Tây', () => {
  const banCongTay = hoSo({
    anhSangCoSan: suyRaAnhSang('ban công trống', 'Tây'),
    dienTich: '1-3m²',
  });

  it('mức sáng suy ra là nắng trực tiếp', () => {
    expect(banCongTay.anhSangCoSan).toBe('nắng trực tiếp');
  });

  it('cây ưa nắng được xếp trên cây ưa bóng', () => {
    const { goiY } = goiYCay(DANH_MUC, banCongTay);
    const viTriHungQue = goiY.findIndex((g) => g.ma === 'hung-que');
    const viTriCauTieuTram = goiY.findIndex((g) => g.ma === 'cau-tieu-tram');

    expect(viTriHungQue).toBeGreaterThanOrEqual(0);
    expect(viTriHungQue).toBeLessThan(viTriCauTieuTram);
  });

  it('loại cây có chậu 35cm vì vượt trần 30cm của không gian 1-3m²', () => {
    const { biLoai } = goiYCay(DANH_MUC, banCongTay);
    expect(biLoai.find((b) => b.ma === 'bang-singapore')?.lyDoLoai).toBe(
      'quá to so với không gian',
    );
  });
});

// ============================================================
describe('Trường hợp biên: người bận, gần như không có thời gian', () => {
  const nguoiBan = hoSo({ thoiGianRanh: 'gần như không có' });

  it('cây tưới 14 ngày một lần được điểm thời gian trọn vẹn', () => {
    const ketQua = chamDiemMotCay(LUOI_HO, nguoiBan);
    expect(ketQua.giaiThich).toContain('14 ngày một lần');
  });

  it('cây phải tưới 2 ngày một lần bị chấm thấp hơn hẳn cây tưới thưa', () => {
    const thua = chamDiemMotCay(LUOI_HO, { ...nguoiBan, coThuNuoi: false });
    const day = chamDiemMotCay(HUNG_QUE, { ...nguoiBan, coThuNuoi: false });
    expect(thua.diem).toBeGreaterThan(day.diem);
  });

  it('loài đứng đầu phải là loài tưới thưa nhất trong nhóm hợp lệ', () => {
    const { goiY } = goiYCay(DANH_MUC, nguoiBan);
    expect(goiY[0].ma).toBe('luoi-ho');
  });
});

// ============================================================
describe('Trường hợp biên: người chưa từng trồng cây', () => {
  const nguoiMoi = hoSo({ kinhNghiem: 'chưa từng trồng' });

  it('không gợi ý loài độ khó 4 lên đầu', () => {
    const { goiY } = goiYCay(DANH_MUC, nguoiMoi);
    expect(goiY[0].ma).not.toBe('bang-singapore');
    expect(goiY[0].ma).not.toBe('ca-chua-bi');
  });

  it('loài độ khó 1 được chấm cao hơn loài độ khó 4 cùng điều kiện khác', () => {
    const de = chamDiemMotCay(LUOI_HO, nguoiMoi);
    const kho = chamDiemMotCay(BANG_SINGAPORE, nguoiMoi);
    expect(de.diem).toBeGreaterThan(kho.diem);
  });

  it('câu giải thích nêu rất dễ chăm', () => {
    expect(chamDiemMotCay(LUOI_HO, nguoiMoi).giaiThich).toContain('rất dễ chăm');
  });
});

// ============================================================
describe('Phong thuỷ và mục đích', () => {
  it('hợp mệnh thì được cộng điểm và nêu trong giải thích', () => {
    const hopMenh = chamDiemMotCay(KIM_NGAN, hoSo({ menh: 'Mộc' }));
    const khongHop = chamDiemMotCay(KIM_NGAN, hoSo({ menh: 'Hoả' }));

    expect(hopMenh.diem).toBeGreaterThan(khongHop.diem);
    expect(hopMenh.giaiThich).toContain('hợp mệnh Mộc');
  });

  it('không khai mệnh thì không ai bị trừ điểm', () => {
    const khongKhai = chamDiemMotCay(KIM_NGAN, hoSo({ menh: null }));
    const hopMenh = chamDiemMotCay(KIM_NGAN, hoSo({ menh: 'Mộc' }));
    expect(khongKhai.diem).toBe(hopMenh.diem);
  });

  it('đáp ứng đủ mục đích thì được trọn điểm mục đích', () => {
    const dayDu = chamDiemMotCay(KIM_NGAN, hoSo({ mucDich: ['trang trí', 'phong thuỷ'] }));
    const motNua = chamDiemMotCay(KIM_NGAN, hoSo({ mucDich: ['trang trí', 'ăn được'] }));
    expect(dayDu.diem).toBeGreaterThan(motNua.diem);
  });
});

// ============================================================
describe('Tính chất chung của bộ gợi ý', () => {
  it('trả về đúng số lượng yêu cầu', () => {
    expect(goiYCay(DANH_MUC, hoSo(), 3).goiY).toHaveLength(3);
  });

  it('kết quả xếp giảm dần theo điểm', () => {
    const { goiY } = goiYCay(DANH_MUC, hoSo());
    const diem = goiY.map((g) => g.diem);
    expect([...diem].sort((a, b) => b - a)).toEqual(diem);
  });

  it('gọi hai lần cho ra kết quả giống hệt nhau', () => {
    const lan1 = goiYCay(DANH_MUC, hoSo());
    const lan2 = goiYCay(DANH_MUC, hoSo());
    expect(lan1).toEqual(lan2);
  });

  it('mọi loài đều nằm ở đúng một trong hai nhóm: gợi ý hoặc bị loại', () => {
    const chatChe = hoSo({ coThuNuoi: true, dienTich: 'dưới 1m²' });
    const { goiY, biLoai } = goiYCay(DANH_MUC, chatChe, 99);
    expect(goiY.length + biLoai.length).toBe(DANH_MUC.length);
  });

  it('danh mục rỗng thì trả về hai mảng rỗng, không ném lỗi', () => {
    expect(goiYCay([], hoSo())).toEqual({ goiY: [], biLoai: [] });
  });

  it('điểm không bao giờ vượt tổng trọng số', () => {
    const { goiY } = goiYCay(DANH_MUC, hoSo({ mucDich: ['trang trí'], menh: 'Mộc' }), 99);
    expect(goiY.every((g) => g.diem <= 100)).toBe(true);
  });

  it('điểm không bao giờ âm', () => {
    const { goiY } = goiYCay(DANH_MUC, hoSo({ thoiGianRanh: 'gần như không có' }), 99);
    expect(goiY.every((g) => g.diem >= 0)).toBe(true);
  });
});
