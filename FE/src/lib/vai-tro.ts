export type VaiTro = 'admin' | 'content' | 'support';

export const TEN_VAI: Record<VaiTro, string> = {
  admin: 'Quản trị',
  content: 'Nội dung',
  support: 'Hỗ trợ',
};

export const MO_TA_VAI: Record<VaiTro, string> = {
  admin: 'Toàn quyền: cấu hình hệ thống, giá gói, hạn mức, quản lý tài khoản quản trị',
  content: 'Nhập cây trồng, viết bài, điền nội dung trang giới thiệu',
  support: 'Xem và khoá tài khoản người dùng, duyệt hàng đợi kiểm duyệt cộng đồng',
};

export interface MucMenu {
  duongDan: string;
  nhan: string;
  vaiDuocPhep: VaiTro[];
  chuaLam?: boolean;
}

/**
 * Nguồn duy nhất khai báo menu và quyền truy cập.
 * Thêm trang mới thì khai ở đây, không rải rác trong từng component.
 */
export const MENU: { nhom: string; muc: MucMenu[] }[] = [
  {
    nhom: 'Tổng quan',
    muc: [
      { duongDan: '/bang-dieu-khien', nhan: 'Bảng điều khiển', vaiDuocPhep: ['admin', 'content', 'support'] },
    ],
  },
  {
    nhom: 'Nội dung',
    muc: [
      { duongDan: '/cay-trong', nhan: 'Cây trồng', vaiDuocPhep: ['admin', 'content'] },
      { duongDan: '/thu-goi-y', nhan: 'Thử gợi ý', vaiDuocPhep: ['admin', 'content'] },
      { duongDan: '/khao-sat', nhan: 'Khảo sát nhập môn', vaiDuocPhep: ['admin', 'content'] },
      { duongDan: '/kham-pha', nhan: 'Khám phá', vaiDuocPhep: ['admin', 'content'], chuaLam: true },
      { duongDan: '/trang-gioi-thieu', nhan: 'Trang giới thiệu', vaiDuocPhep: ['admin', 'content'], chuaLam: true },
      { duongDan: '/lien-ket-tiep-thi', nhan: 'Liên kết tiếp thị', vaiDuocPhep: ['admin', 'content'], chuaLam: true },
    ],
  },
  {
    nhom: 'Người dùng',
    muc: [
      { duongDan: '/nguoi-dung', nhan: 'Người dùng app', vaiDuocPhep: ['admin', 'support'], chuaLam: true },
      { duongDan: '/kiem-duyet', nhan: 'Kiểm duyệt', vaiDuocPhep: ['admin', 'support'], chuaLam: true },
    ],
  },
  {
    nhom: 'Chợ Vật Tư',
    muc: [
      { duongDan: '/san-pham', nhan: 'Sản phẩm', vaiDuocPhep: ['admin', 'content'], chuaLam: true },
      { duongDan: '/don-hang', nhan: 'Đơn hàng', vaiDuocPhep: ['admin', 'support'], chuaLam: true },
    ],
  },
  {
    nhom: 'Hệ thống',
    muc: [
      { duongDan: '/tai-khoan-quan-tri', nhan: 'Tài khoản quản trị', vaiDuocPhep: ['admin'] },
      { duongDan: '/cau-hinh', nhan: 'Cấu hình', vaiDuocPhep: ['admin'] },
      { duongDan: '/nhat-ky', nhan: 'Nhật ký thao tác', vaiDuocPhep: ['admin'] },
    ],
  },
];
