/** Định dạng ngày giờ kiểu Việt Nam, dùng chung cho các bảng trong Web Admin. */
export function dinhDangNgayGio(gia_tri: string | Date | null | undefined): string {
  if (!gia_tri) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(gia_tri));
}

/** Chỉ ngày, không giờ — dùng cho những chỗ không cần độ chính xác tới phút. */
export function dinhDangNgay(gia_tri: string | Date | null | undefined): string {
  if (!gia_tri) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(gia_tri));
}

/** Định dạng số tiền VNĐ, dùng cho trang cấu hình giá gói. */
export function dinhDangTien(so: number): string {
  return new Intl.NumberFormat('vi-VN').format(so) + 'đ';
}
