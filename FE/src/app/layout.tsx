import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// next/font tự host font, không gọi ra Google lúc chạy và không gây nhảy layout.
const chuChinh = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-chinh',
});

const chuSo = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  weight: ['500'],
  display: 'swap',
  variable: '--font-so',
});

export const metadata: Metadata = {
  title: { default: 'Web Admin Chạm Xanh', template: '%s · Chạm Xanh' },
  description: 'Nơi quản lý dữ liệu, nội dung và người dùng của ứng dụng Chạm Xanh.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#456805',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${chuChinh.variable} ${chuSo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
