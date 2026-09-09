import { ttlSangMiliGiay } from './ttl.util';

describe('ttlSangMiliGiay', () => {
  it('đổi giây', () => {
    expect(ttlSangMiliGiay('30s')).toBe(30_000);
  });

  it('đổi phút', () => {
    expect(ttlSangMiliGiay('15m')).toBe(900_000);
  });

  it('đổi giờ', () => {
    expect(ttlSangMiliGiay('12h')).toBe(43_200_000);
  });

  it('đổi ngày', () => {
    expect(ttlSangMiliGiay('30d')).toBe(2_592_000_000);
  });

  it('bỏ qua khoảng trắng thừa', () => {
    expect(ttlSangMiliGiay('  7d  ')).toBe(604_800_000);
  });

  it.each(['15', 'm', '15x', '', 'abc', '1.5h', '-5m', '15 m'])(
    'ném lỗi với định dạng sai: "%s"',
    (dauVao) => {
      expect(() => ttlSangMiliGiay(dauVao)).toThrow(/không hợp lệ/);
    },
  );

  it('ném lỗi khi thời hạn bằng 0', () => {
    expect(() => ttlSangMiliGiay('0m')).toThrow(/lớn hơn 0/);
  });
});
