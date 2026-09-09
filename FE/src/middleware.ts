import { NextResponse, type NextRequest } from 'next/server';

const COOKIE_ACCESS = 'cx_access';
const TRANG_CONG = ['/dang-nhap'];

/**
 * Chặn ở tầng biên: chưa có cookie thì không vào được trang quản trị.
 * Đây chỉ là lớp chặn đầu tiên cho trải nghiệm — quyền thật vẫn do API kiểm.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const daDangNhap = Boolean(req.cookies.get(COOKIE_ACCESS)?.value);
  const laTrangCong = TRANG_CONG.some((p) => pathname.startsWith(p));

  if (!daDangNhap && !laTrangCong) {
    const url = req.nextUrl.clone();
    url.pathname = '/dang-nhap';
    url.searchParams.set('tiep-tuc', pathname);
    return NextResponse.redirect(url);
  }

  if (daDangNhap && laTrangCong) {
    const url = req.nextUrl.clone();
    url.pathname = '/bang-dieu-khien';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
