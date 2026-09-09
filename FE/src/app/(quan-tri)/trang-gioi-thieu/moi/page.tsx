import type { Metadata } from 'next';
import Link from 'next/link';
import FormBaiViet from '../form-bai-viet';

export const metadata: Metadata = { title: 'Thêm bài viết' };

export default function TrangThemBaiViet() {
  return (
    <>
      <div className="dau-trang">
        <p className="nhan">
          <Link href="/trang-gioi-thieu">Trang giới thiệu</Link> / Thêm mới
        </p>
        <h1>Thêm bài viết</h1>
      </div>
      <FormBaiViet baiVietBanDau={null} />
    </>
  );
}
