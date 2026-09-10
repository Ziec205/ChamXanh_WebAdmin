import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const cauHinh = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // next-env.d.ts do Next.js tự sinh và tự quản lý — không được sửa tay,
  // nên cũng không lint. Thiếu dòng này khiến `eslint .` (khác `next lint`,
  // vốn tự bỏ qua file này) báo lỗi triple-slash-reference ở mọi lần chạy.
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
];

export default cauHinh;
