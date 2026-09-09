import { NextResponse } from 'next/server';
import { goiApiCong, LoiApi, COOKIE_ACCESS, COOKIE_REFRESH, type KetQuaDangNhap } from '@/lib/api';

/**
 * Đứng giữa trình duyệt và API NestJS.
 * Token được cất vào cookie httpOnly nên mã JavaScript phía client
 * không đọc được — kể cả khi trang bị chèn mã độc.
 */
export async function POST(req: Request) {
  let than: { email?: string; matKhau?: string };
  try {
    than = await req.json();
  } catch {
    return NextResponse.json({ thongBao: 'Dữ liệu gửi lên không hợp lệ.' }, { status: 400 });
  }

  if (!than.email || !than.matKhau) {
    return NextResponse.json({ thongBao: 'Vui lòng nhập đủ email và mật khẩu.' }, { status: 400 });
  }

  try {
    const ketQua = await goiApiCong<KetQuaDangNhap>('/auth/dang-nhap', {
      method: 'POST',
      body: JSON.stringify({ email: than.email, matKhau: than.matKhau }),
    });

    const res = NextResponse.json({ nguoiDung: ketQua.nguoiDung });
    const anToan = process.env.NODE_ENV === 'production';

    res.cookies.set(COOKIE_ACCESS, ketQua.accessToken, {
      httpOnly: true,
      secure: anToan,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15,
    });
    res.cookies.set(COOKIE_REFRESH, ketQua.refreshToken, {
      httpOnly: true,
      secure: anToan,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (e) {
    const loi = e as LoiApi;
    return NextResponse.json(
      { thongBao: loi.message },
      { status: loi.maLoi >= 400 && loi.maLoi < 600 ? loi.maLoi : 502 },
    );
  }
}
