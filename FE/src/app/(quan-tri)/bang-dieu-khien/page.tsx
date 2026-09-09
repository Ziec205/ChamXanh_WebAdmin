import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Bảng điều khiển' };

/**
 * Các ô số liệu sẽ nối vào analytics_events ở giai đoạn 3.
 * Hiện hiển thị dấu gạch ngang thay vì số giả — không bịa số liệu.
 */
const O_SO_LIEU = [
  { nhan: 'Người dùng app', giaTri: '—', chuThich: 'nối ở GĐ 3' },
  { nhan: 'Loài cây trong hệ thống', giaTri: '—', chuThich: 'nối ở GĐ 2' },
  { nhan: 'Đơn hàng chờ xử lý', giaTri: '—', chuThich: 'nối ở GĐ 7' },
  { nhan: 'Bài chờ kiểm duyệt', giaTri: '—', chuThich: 'nối ở GĐ 8' },
];

export default function TrangBangDieuKhien() {
  return (
    <>
      <div className="dau-trang">
        <div>
          <p className="nhan">Tổng quan</p>
          <h1>Bảng điều khiển</h1>
        </div>
      </div>

      <div className="luoi-so-lieu">
        {O_SO_LIEU.map((o) => (
          <div key={o.nhan} className="o-so-lieu">
            <p className="nhan">{o.nhan}</p>
            <p className="con-so">{o.giaTri}</p>
            <p className="chu-thich">{o.chuThich}</p>
          </div>
        ))}
      </div>

      <div className="the" style={{ marginTop: 'var(--k5)' }}>
        <h2 style={{ marginBottom: 'var(--k3)' }}>Hệ thống đang ở giai đoạn 1</h2>
        <p style={{ color: 'var(--muc-phu)', marginBottom: 'var(--k4)', maxWidth: '68ch' }}>
          Phần xác thực, phân quyền ba vai và quản lý tài khoản quản trị đã hoạt động. Các module
          còn lại được dựng theo trình tự trong tài liệu đặc tả — mỗi giai đoạn phải đạt mốc kiểm
          chứng trước khi sang giai đoạn kế.
        </p>
        <ol className="danh-sach-gd">
          <li className="xong">Nền tảng API — xác thực, phân quyền, tài khoản quản trị</li>
          <li>Dữ liệu cây và thuật toán gợi ý</li>
          <li>Web Admin — quản lý cây trồng, người dùng, số liệu</li>
          <li>Nội dung và web giới thiệu</li>
          <li>Ứng dụng — lõi chăm cây</li>
          <li>Trợ lý AI và liên kết tiếp thị</li>
          <li>Chợ Vật Tư</li>
          <li>Cộng đồng và nhắn tin</li>
          <li>Hoàn thiện và phát hành</li>
        </ol>
      </div>
    </>
  );
}
