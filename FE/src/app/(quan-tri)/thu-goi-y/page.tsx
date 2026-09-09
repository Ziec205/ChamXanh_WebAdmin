import type { Metadata } from 'next';
import FormThuGoiY from './form-thu-goi-y';

export const metadata: Metadata = { title: 'Thử gợi ý' };

export default function TrangThuGoiY() {
  return (
    <>
      <div className="dau-trang">
        <p className="nhan">Nội dung</p>
        <h1>Thử gợi ý</h1>
        <p className="mo-ta-trang">
          Nhập một bộ câu trả lời khảo sát mẫu để xem thuật toán gợi ý cây trả về gì — không cần
          mở ứng dụng, không cần lập trình viên. Dùng công cụ này để kiểm tra khi vừa thêm loài
          cây mới hoặc vừa đổi trọng số ở trang Cấu hình.
        </p>
      </div>
      <FormThuGoiY />
    </>
  );
}
