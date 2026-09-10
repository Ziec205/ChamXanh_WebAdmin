import { LoaiViec } from 'src/common/constants/cay-trong.const';

export interface HuongDanMacDinh {
  loai: LoaiViec;
  tieuDe: string;
  cacBuoc: { thuTu: number; tieuDe: string; moTa?: string }[];
}

/** Nội dung khởi tạo — Admin sửa lại sau qua Web Admin (chưa có trang, xem CLAUDE.md). */
export const HUONG_DAN_MAC_DINH: HuongDanMacDinh[] = [
  {
    loai: 'tưới',
    tieuDe: 'Cách tưới đúng',
    cacBuoc: [
      { thuTu: 1, tieuDe: 'Kiểm tra đất', moTa: 'Chạm ngón tay vào đất theo độ sâu hướng dẫn của từng cây, khô mới tưới.' },
      { thuTu: 2, tieuDe: 'Tưới từ từ', moTa: 'Tưới đều quanh gốc tới khi nước rỉ ra lỗ thoát đáy chậu.' },
      { thuTu: 3, tieuDe: 'Đổ bỏ nước đọng', moTa: 'Đổ hết nước đọng ở đĩa lót sau 15-30 phút, tránh úng rễ.' },
    ],
  },
  {
    loai: 'bón phân',
    tieuDe: 'Cách bón phân an toàn',
    cacBuoc: [
      { thuTu: 1, tieuDe: 'Tưới ẩm đất trước', moTa: 'Không bón phân khi đất đang khô hoặc cây đang héo.' },
      { thuTu: 2, tieuDe: 'Pha loãng đúng liều', moTa: 'Pha theo hướng dẫn trên bao bì, thà loãng còn hơn đặc.' },
      { thuTu: 3, tieuDe: 'Bón quanh gốc', moTa: 'Tưới dung dịch quanh gốc, tránh đổ trực tiếp lên lá và thân.' },
    ],
  },
  {
    loai: 'phun sương',
    tieuDe: 'Cách phun sương cho lá',
    cacBuoc: [
      { thuTu: 1, tieuDe: 'Chọn thời điểm', moTa: 'Phun vào sáng sớm hoặc chiều mát, tránh giữa trưa nắng gắt.' },
      { thuTu: 2, tieuDe: 'Phun mặt dưới lá', moTa: 'Mặt dưới lá hấp thụ ẩm tốt hơn và ít đọng nước gây nấm.' },
      { thuTu: 3, tieuDe: 'Không phun quá đẫm', moTa: 'Phun tơi mịn, không để nước đọng thành giọt lớn trên lá.' },
    ],
  },
  {
    loai: 'thay đất',
    tieuDe: 'Cách thay đất, thay chậu',
    cacBuoc: [
      { thuTu: 1, tieuDe: 'Tách cây khỏi chậu cũ', moTa: 'Nghiêng chậu, vỗ nhẹ quanh thành để đất tơi ra trước khi rút cây.' },
      { thuTu: 2, tieuDe: 'Vệ sinh rễ', moTa: 'Gỡ bớt đất cũ bám rễ, cắt bỏ rễ thối đen hoặc nhũn.' },
      { thuTu: 3, tieuDe: 'Trồng vào chậu/đất mới', moTa: 'Đặt cây vào giữa chậu mới, thêm đất mới xung quanh, nén nhẹ.' },
      { thuTu: 4, tieuDe: 'Hoàn tất', moTa: 'Tưới nhẹ một lần, đặt cây ở nơi mát vài ngày để cây hồi phục.' },
    ],
  },
];
