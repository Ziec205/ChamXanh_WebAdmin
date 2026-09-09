import Link from 'next/link';

export default function KhongTimThay() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--k5)',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '42ch' }}>
        <p className="nhan">Lỗi 404</p>
        <h1 style={{ margin: '8px 0 10px', color: 'var(--xanh-dam)' }}>Không tìm thấy trang</h1>
        <p style={{ color: 'var(--muc-phu)', marginBottom: 'var(--k5)' }}>
          Đường dẫn bạn mở không tồn tại hoặc đã được đổi tên.
        </p>
        <Link className="nut nut-chinh" href="/bang-dieu-khien">
          Về bảng điều khiển
        </Link>
      </div>
    </main>
  );
}
