'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MENU, type VaiTro } from '@/lib/vai-tro';

export default function ThanhBen({ vaiTro }: { vaiTro: VaiTro }) {
  const duongDanHienTai = usePathname();

  return (
    <nav className="thanh-ben" aria-label="Điều hướng chính">
      <Link href="/bang-dieu-khien" className="thuong-hieu">
        <span className="dau-la" aria-hidden="true">🌿</span>
        <span>Chạm Xanh</span>
      </Link>

      <div className="cuon-menu">
        {MENU.map((nhom) => {
          // Ẩn hẳn nhóm nếu vai hiện tại không được vào mục nào trong đó.
          const mucHienThi = nhom.muc.filter((m) => m.vaiDuocPhep.includes(vaiTro));
          if (mucHienThi.length === 0) return null;

          return (
            <div key={nhom.nhom} className="nhom-menu">
              <p className="nhan ten-nhom">{nhom.nhom}</p>
              <ul>
                {mucHienThi.map((muc) => {
                  const dangMo = duongDanHienTai.startsWith(muc.duongDan);
                  return (
                    <li key={muc.duongDan}>
                      <Link
                        href={muc.duongDan}
                        className={`muc-menu${dangMo ? ' dang-mo' : ''}`}
                        aria-current={dangMo ? 'page' : undefined}
                      >
                        <span>{muc.nhan}</span>
                        {muc.chuaLam && <span className="chua-lam">sắp có</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
