import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:3001/api/v1';

export const COOKIE_ACCESS = 'cx_access';
export const COOKIE_REFRESH = 'cx_refresh';

export interface PhanHoiApi<T> {
  thanhCong: boolean;
  duLieu?: T;
  thongBao?: string | string[];
  maLoi?: number;
}

export class LoiApi extends Error {
  constructor(
    message: string,
    readonly maLoi: number,
  ) {
    super(message);
  }
}

function gomThongBao(thongBao: string | string[] | undefined, mac_dinh: string): string {
  if (!thongBao) return mac_dinh;
  return Array.isArray(thongBao) ? thongBao.join('. ') : thongBao;
}

/** Gọi API mà không cần đăng nhập. Dùng cho đăng nhập và làm mới token. */
export async function goiApiCong<T>(
  duongDan: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${duongDan}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    cache: 'no-store',
  });

  const body = (await res.json().catch(() => ({}))) as PhanHoiApi<T>;

  if (!res.ok || !body.thanhCong) {
    throw new LoiApi(
      gomThongBao(body.thongBao, 'Không kết nối được tới máy chủ.'),
      body.maLoi ?? res.status,
    );
  }
  return body.duLieu as T;
}

/**
 * Gọi API kèm access token lấy từ cookie httpOnly.
 * Chỉ chạy phía server — token không bao giờ tới trình duyệt.
 */
export async function goiApi<T>(duongDan: string, init: RequestInit = {}): Promise<T> {
  const kho = await cookies();
  const token = kho.get(COOKIE_ACCESS)?.value;

  const res = await fetch(`${API_URL}${duongDan}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });

  const body = (await res.json().catch(() => ({}))) as PhanHoiApi<T>;

  if (!res.ok || !body.thanhCong) {
    throw new LoiApi(
      gomThongBao(body.thongBao, 'Không kết nối được tới máy chủ.'),
      body.maLoi ?? res.status,
    );
  }
  return body.duLieu as T;
}

export interface TaiKhoanDangNhap {
  id: string;
  email: string;
  hoTen: string;
  vaiTro: 'admin' | 'content' | 'support';
}

export interface KetQuaDangNhap {
  accessToken: string;
  refreshToken: string;
  nguoiDung: TaiKhoanDangNhap;
}
