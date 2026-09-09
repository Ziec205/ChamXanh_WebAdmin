import {
  DIEN_TICH,
  HUONG,
  KINH_NGHIEM,
  MENH,
  MIEN,
  NOI_DAT,
  THOI_GIAN_RANH,
} from 'src/common/constants/cay-trong.const';

/**
 * Bộ câu hỏi khảo sát nhập môn mặc định.
 *
 * Đây chỉ là điểm khởi đầu — sau khi seed, Admin sửa nội dung câu hỏi và thứ tự
 * ngay trên Web Admin. Riêng trường `khoa` thì KHÔNG được đổi: thuật toán gợi ý
 * đọc câu trả lời theo khoá này.
 */
export interface DapAnMacDinh {
  giaTri: string;
  nhan: string;
  moTa?: string;
}

export interface CauHoiMacDinh {
  khoa: string;
  thuTu: number;
  cauHoi: string;
  moTa?: string;
  nhieuLuaChon: boolean;
  batBuoc: boolean;
  dapAn: DapAnMacDinh[];
}

export const CAU_HOI_MAC_DINH: CauHoiMacDinh[] = [
  {
    khoa: 'noiDat',
    thuTu: 1,
    cauHoi: 'Bạn định đặt cây ở đâu?',
    moTa: 'Đây là yếu tố quyết định nhiều nhất tới việc cây sống hay chết.',
    nhieuLuaChon: false,
    batBuoc: true,
    dapAn: [
      { giaTri: NOI_DAT[0], nhan: 'Trong nhà, chỗ thiếu sáng', moTa: 'Góc phòng, hành lang, phòng không có cửa sổ' },
      { giaTri: NOI_DAT[1], nhan: 'Gần cửa sổ', moTa: 'Cách cửa sổ trong vòng 1 mét' },
      { giaTri: NOI_DAT[2], nhan: 'Ban công có mái che' },
      { giaTri: NOI_DAT[3], nhan: 'Ban công trống', moTa: 'Không mái, hứng nắng trực tiếp' },
      { giaTri: NOI_DAT[4], nhan: 'Sân thượng' },
    ],
  },
  {
    khoa: 'huong',
    thuTu: 2,
    cauHoi: 'Chỗ đó quay về hướng nào?',
    moTa: 'Không nhớ chính xác thì chọn "Không rõ", hệ thống vẫn gợi ý được.',
    nhieuLuaChon: false,
    batBuoc: true,
    dapAn: [
      { giaTri: HUONG[0], nhan: 'Đông', moTa: 'Nắng sớm, dịu' },
      { giaTri: HUONG[1], nhan: 'Tây', moTa: 'Nắng chiều, gắt' },
      { giaTri: HUONG[2], nhan: 'Nam', moTa: 'Nhiều nắng cả ngày' },
      { giaTri: HUONG[3], nhan: 'Bắc', moTa: 'Gần như không có nắng trực tiếp' },
      { giaTri: HUONG[4], nhan: 'Không rõ' },
    ],
  },
  {
    khoa: 'dienTich',
    thuTu: 3,
    cauHoi: 'Không gian trồng rộng khoảng bao nhiêu?',
    nhieuLuaChon: false,
    batBuoc: true,
    dapAn: [
      { giaTri: DIEN_TICH[0], nhan: 'Dưới 1m²', moTa: 'Một góc bàn, kệ nhỏ' },
      { giaTri: DIEN_TICH[1], nhan: '1 đến 3m²', moTa: 'Ban công căn hộ điển hình' },
      { giaTri: DIEN_TICH[2], nhan: '3 đến 10m²' },
      { giaTri: DIEN_TICH[3], nhan: 'Trên 10m²', moTa: 'Sân thượng, sân vườn' },
    ],
  },
  {
    khoa: 'kinhNghiem',
    thuTu: 4,
    cauHoi: 'Bạn đã trồng cây bao giờ chưa?',
    nhieuLuaChon: false,
    batBuoc: true,
    dapAn: [
      { giaTri: KINH_NGHIEM[0], nhan: 'Chưa từng trồng' },
      { giaTri: KINH_NGHIEM[1], nhan: 'Mới bắt đầu', moTa: 'Đã thử nhưng cây hay chết' },
      { giaTri: KINH_NGHIEM[2], nhan: 'Đã trồng vài cây', moTa: 'Cây sống ổn' },
      { giaTri: KINH_NGHIEM[3], nhan: 'Có kinh nghiệm' },
    ],
  },
  {
    khoa: 'thoiGianRanh',
    thuTu: 5,
    cauHoi: 'Mỗi ngày bạn dành được bao nhiêu thời gian cho cây?',
    moTa: 'Trả lời thật giúp chúng tôi không gợi ý loài cây bạn không theo nổi.',
    nhieuLuaChon: false,
    batBuoc: true,
    dapAn: [
      { giaTri: THOI_GIAN_RANH[0], nhan: 'Gần như không có', moTa: 'Hay đi công tác, quên tưới' },
      { giaTri: THOI_GIAN_RANH[1], nhan: 'Vài phút mỗi ngày' },
      { giaTri: THOI_GIAN_RANH[2], nhan: '15 đến 30 phút mỗi ngày' },
      { giaTri: THOI_GIAN_RANH[3], nhan: 'Thoải mái', moTa: 'Chăm cây là sở thích' },
    ],
  },
  {
    khoa: 'coThuNuoi',
    thuTu: 6,
    cauHoi: 'Nhà bạn có nuôi chó hoặc mèo không?',
    moTa: 'Nhiều loài cây cảnh phổ biến gây độc cho thú nuôi. Chúng tôi sẽ loại hẳn những loài đó.',
    nhieuLuaChon: false,
    batBuoc: true,
    dapAn: [
      { giaTri: 'true', nhan: 'Có' },
      { giaTri: 'false', nhan: 'Không' },
    ],
  },
  {
    khoa: 'mucDich',
    thuTu: 7,
    cauHoi: 'Bạn trồng cây để làm gì?',
    moTa: 'Chọn được nhiều mục.',
    nhieuLuaChon: true,
    batBuoc: false,
    dapAn: [
      { giaTri: 'lọc không khí', nhan: 'Lọc không khí' },
      { giaTri: 'trang trí', nhan: 'Trang trí không gian' },
      { giaTri: 'ăn được', nhan: 'Trồng rau để ăn' },
      { giaTri: 'phong thuỷ', nhan: 'Phong thuỷ, may mắn' },
    ],
  },
  {
    khoa: 'mien',
    thuTu: 8,
    cauHoi: 'Bạn đang sống ở miền nào?',
    moTa: 'Lịch tưới sẽ tự đổi theo mùa của miền bạn ở.',
    nhieuLuaChon: false,
    batBuoc: true,
    dapAn: MIEN.map((m) => ({ giaTri: m, nhan: `Miền ${m}` })),
  },
  {
    khoa: 'menh',
    thuTu: 9,
    cauHoi: 'Bạn thuộc mệnh nào?',
    moTa: 'Câu này không bắt buộc. Bỏ qua thì không ai bị trừ điểm.',
    nhieuLuaChon: false,
    batBuoc: false,
    // Không có đáp án 'không quan tâm': câu hỏi vốn đã không bắt buộc,
    // bỏ trống là đủ. Dùng chuỗi rỗng làm giá trị mang nghĩa sẽ gây lỗi ngầm.
    dapAn: MENH.map((m) => ({ giaTri: m, nhan: `Mệnh ${m}` })),
  },
];
