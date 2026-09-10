import { gomNhacNhoTheoNguoiDung, locViecDenHan, type ViecDeNhac } from './gom-nhac-nho';

const HOM_NAY = new Date('2026-06-15T08:00:00Z');

function viec(nguoiDungId: string, loai: string, ngayGio: string, tenCay = 'Cây thử'): ViecDeNhac {
  return { nguoiDungId, loai, hanKeTiep: new Date(ngayGio), tenCay };
}

describe('locViecDenHan', () => {
  it('giữ lại việc quá hạn', () => {
    const ds = [viec('u1', 'tưới', '2026-06-10T00:00:00Z')];
    expect(locViecDenHan(ds, HOM_NAY)).toHaveLength(1);
  });

  it('giữ lại việc đến hạn đúng hôm nay, kể cả cuối ngày', () => {
    const ds = [viec('u1', 'tưới', '2026-06-15T23:00:00Z')];
    expect(locViecDenHan(ds, HOM_NAY)).toHaveLength(1);
  });

  it('loại việc còn hạn ở tương lai', () => {
    const ds = [viec('u1', 'tưới', '2026-06-16T00:00:00Z')];
    expect(locViecDenHan(ds, HOM_NAY)).toHaveLength(0);
  });
});

describe('gomNhacNhoTheoNguoiDung', () => {
  it('gộp đúng theo từng người dùng, không lẫn người khác', () => {
    const ds = [
      viec('u1', 'tưới', '2026-06-10T00:00:00Z', 'Trầu bà'),
      viec('u2', 'bón phân', '2026-06-10T00:00:00Z', 'Sen đá'),
    ];
    const ketQua = gomNhacNhoTheoNguoiDung(ds);
    expect(ketQua).toHaveLength(2);
    expect(ketQua.find((k) => k.nguoiDungId === 'u1')?.soViec).toBe(1);
    expect(ketQua.find((k) => k.nguoiDungId === 'u2')?.soViec).toBe(1);
  });

  it('một việc — nội dung nêu đích danh cây và loại việc', () => {
    const ds = [viec('u1', 'tưới', '2026-06-10T00:00:00Z', 'Trầu bà')];
    const [nhac] = gomNhacNhoTheoNguoiDung(ds);
    expect(nhac.noiDung).toContain('Trầu bà');
    expect(nhac.noiDung).toContain('tưới');
    expect(nhac.tieuDe).toContain('một việc');
  });

  it('nhiều việc cùng người — tiêu đề nêu đúng số lượng', () => {
    const ds = [
      viec('u1', 'tưới', '2026-06-10T00:00:00Z', 'Trầu bà'),
      viec('u1', 'bón phân', '2026-06-11T00:00:00Z', 'Sen đá'),
      viec('u1', 'phun sương', '2026-06-12T00:00:00Z', 'Dương xỉ'),
    ];
    const [nhac] = gomNhacNhoTheoNguoiDung(ds);
    expect(nhac.soViec).toBe(3);
    expect(nhac.tieuDe).toContain('3 việc');
  });

  it('không có việc nào thì không tạo nhắc nhở', () => {
    expect(gomNhacNhoTheoNguoiDung([])).toHaveLength(0);
  });
});
