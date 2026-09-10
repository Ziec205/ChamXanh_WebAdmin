/**
 * Hàm thuần: gom việc chăm sóc đến hạn/quá hạn theo từng người dùng, rồi
 * soạn nội dung thông báo. Tách khỏi ThongBaoService để test không cần
 * Mongo lẫn Expo — chỉ nhận mảng phẳng, không đụng model.
 */
export interface ViecDeNhac {
  nguoiDungId: string;
  loai: string;
  hanKeTiep: Date;
  tenCay: string;
}

export interface NhacNhoMotNguoi {
  nguoiDungId: string;
  tieuDe: string;
  noiDung: string;
  soViec: number;
}

/** Chỉ nhắc việc đến hạn HÔM NAY hoặc đã quá hạn — không nhắc việc còn xa. */
export function locViecDenHan(viecList: ViecDeNhac[], homNay: Date): ViecDeNhac[] {
  // Dùng giờ UTC thay vì giờ hệ thống — máy chủ (Render) chạy UTC, máy dev
  // có thể ở múi giờ khác, trộn hai loại giờ sẽ lệch ranh giới "hôm nay".
  const cuoiNgayHomNay = new Date(homNay);
  cuoiNgayHomNay.setUTCHours(23, 59, 59, 999);
  return viecList.filter((v) => v.hanKeTiep.getTime() <= cuoiNgayHomNay.getTime());
}

export function gomNhacNhoTheoNguoiDung(viecDenHan: ViecDeNhac[]): NhacNhoMotNguoi[] {
  const theoNguoiDung = new Map<string, ViecDeNhac[]>();
  for (const v of viecDenHan) {
    const ds = theoNguoiDung.get(v.nguoiDungId) ?? [];
    ds.push(v);
    theoNguoiDung.set(v.nguoiDungId, ds);
  }

  const ketQua: NhacNhoMotNguoi[] = [];
  for (const [nguoiDungId, ds] of theoNguoiDung) {
    const noiDung =
      ds.length === 1
        ? `${ds[0].tenCay} cần được ${ds[0].loai} hôm nay.`
        : `${ds.length} việc chăm sóc đang chờ bạn, trong đó có ${ds[0].tenCay} cần ${ds[0].loai}.`;

    ketQua.push({
      nguoiDungId,
      tieuDe: ds.length === 1 ? 'Có một việc cần làm hôm nay 🌱' : `${ds.length} việc cần làm hôm nay 🌱`,
      noiDung,
      soViec: ds.length,
    });
  }
  return ketQua;
}
