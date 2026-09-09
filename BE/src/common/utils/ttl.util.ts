const HE_SO: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/**
 * Đổi chuỗi thời hạn dạng "15m", "12h", "30d" thành mili giây.
 * Sai định dạng thì ném lỗi ngay lúc khởi động thay vì âm thầm cấp
 * token sống mãi hoặc hết hạn tức thì.
 */
export function ttlSangMiliGiay(ttl: string): number {
  const khop = /^(\d+)([smhd])$/.exec(ttl.trim());
  if (!khop) {
    throw new Error(`Giá trị thời hạn token không hợp lệ: "${ttl}". Ví dụ đúng: 15m, 12h, 30d.`);
  }
  const soLuong = Number(khop[1]);
  if (soLuong <= 0) {
    throw new Error(`Thời hạn token phải lớn hơn 0, nhận được: "${ttl}".`);
  }
  return soLuong * HE_SO[khop[2]];
}
