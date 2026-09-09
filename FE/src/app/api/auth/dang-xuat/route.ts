import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { goiApiCong, COOKIE_ACCESS, COOKIE_REFRESH } from '@/lib/api';

export async function POST() {
  const kho = await cookies();
  const refreshToken = kho.get(COOKIE_REFRESH)?.value;

  // Thu hồi phía máy chủ. Lỗi ở bước này không được cản việc xoá cookie.
  if (refreshToken) {
    await goiApiCong('/auth/dang-xuat', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_ACCESS);
  res.cookies.delete(COOKIE_REFRESH);
  return res;
}
