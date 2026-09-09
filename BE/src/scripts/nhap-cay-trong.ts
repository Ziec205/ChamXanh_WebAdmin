/**
 * Nhập dữ liệu cây trồng từ tệp Excel vào MongoDB.
 *
 *   npm run nhap:cay                        # dùng đường dẫn mặc định
 *   npm run nhap:cay -- --thu               # chỉ kiểm tra, không ghi
 *   npm run nhap:cay -- --tep=duong/dan.xlsx
 *
 * Kịch bản dùng: đội nội dung sửa tệp Excel rồi chạy lại lệnh này.
 * Loài đã có (khớp theo cột "ma") sẽ được cập nhật, loài mới thì thêm vào.
 * Không bao giờ xoá loài — muốn ẩn thì tắt cờ dangHienThi trên Web Admin.
 */
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as ExcelJS from 'exceljs';
import { resolve } from 'node:path';
import { Plant, PlantDocument } from '../modules/plants/schemas/plant.schema';
import {
  CONG_DUNG,
  MENH,
  MUC_AM,
  MUC_SANG,
  NHOM_CAY,
} from '../common/constants/cay-trong.const';

const DUONG_DAN_MAC_DINH = resolve(__dirname, '../../../../Document/du-lieu-cay-trong.xlsx');

interface LoiDong {
  dong: number;
  ma: string;
  van_de: string;
}

/** Ô Excel có thể là chuỗi, số, hoặc đối tượng rich-text — quy hết về chuỗi sạch. */
function docChuoi(o: ExcelJS.CellValue): string {
  if (o === null || o === undefined) return '';
  if (typeof o === 'object' && 'richText' in o) {
    return (o.richText as { text: string }[]).map((r) => r.text).join('').trim();
  }
  if (typeof o === 'object' && 'text' in o) return String((o as { text: unknown }).text).trim();
  return String(o).trim();
}

function docSo(o: ExcelJS.CellValue): number | null {
  const s = docChuoi(o);
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function docBool(o: ExcelJS.CellValue): boolean {
  return ['có', 'co', 'true', '1', 'x'].includes(docChuoi(o).toLowerCase());
}

/** Nhiều giá trị trong một ô, cách nhau bằng dấu chấm phẩy. */
function docDanhSach(o: ExcelJS.CellValue): string[] {
  return docChuoi(o)
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean);
}

async function chay() {
  const logger = new Logger('NhapCayTrong');

  const thamSo = process.argv.slice(2);
  const chiThu = thamSo.includes('--thu');
  const tepTuyChon = thamSo.find((t) => t.startsWith('--tep='))?.slice('--tep='.length);
  const duongDan = tepTuyChon ? resolve(tepTuyChon) : DUONG_DAN_MAC_DINH;

  logger.log(`Đọc tệp: ${duongDan}`);
  if (chiThu) logger.warn('Chế độ thử — sẽ kiểm tra dữ liệu nhưng KHÔNG ghi vào cơ sở dữ liệu.');

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(duongDan);

  const wsCay = wb.getWorksheet('Cây trồng');
  if (!wsCay) throw new Error('Không tìm thấy sheet "Cây trồng" trong tệp.');

  // Dòng 1 là tên khoá kỹ thuật — chính là hợp đồng giữa tệp Excel và mã nguồn.
  const khoaCot = new Map<string, number>();
  wsCay.getRow(1).eachCell((o, cot) => {
    const khoa = docChuoi(o.value);
    if (khoa) khoaCot.set(khoa, cot);
  });

  const canCo = ['ma', 'tenVi', 'nhom', 'anhSangToiThieu', 'chuKyTuoiMuaKho', 'doKho'];
  const thieu = canCo.filter((k) => !khoaCot.has(k));
  if (thieu.length > 0) {
    throw new Error(
      `Tệp Excel thiếu cột bắt buộc: ${thieu.join(', ')}.\n` +
        'Dòng 1 phải giữ nguyên tên khoá kỹ thuật — xem sheet "Hướng dẫn nhập liệu", mục 10.',
    );
  }

  const lay = (dong: ExcelJS.Row, khoa: string): ExcelJS.CellValue =>
    khoaCot.has(khoa) ? dong.getCell(khoaCot.get(khoa)!).value : null;

  // ---- Đọc bảng bệnh trước, gom theo mã cây ----
  const benhTheoCay = new Map<string, { trieuChung: string; nguyenNhan: string; cachXuLy: string }[]>();
  const wsBenh = wb.getWorksheet('Bệnh thường gặp');
  if (wsBenh) {
    wsBenh.eachRow((dong, soDong) => {
      if (soDong <= 2) return; // bỏ dòng khoá và dòng nhãn
      const ma = docChuoi(dong.getCell(1).value).toLowerCase();
      const trieuChung = docChuoi(dong.getCell(2).value);
      if (!ma || !trieuChung) return;

      if (!benhTheoCay.has(ma)) benhTheoCay.set(ma, []);
      benhTheoCay.get(ma)!.push({
        trieuChung,
        nguyenNhan: docChuoi(dong.getCell(3).value),
        cachXuLy: docChuoi(dong.getCell(4).value),
      });
    });
  }

  // ---- Đọc và kiểm tra từng loài ----
  const loi: LoiDong[] = [];
  const banGhi: Record<string, unknown>[] = [];
  const maDaGap = new Set<string>();

  wsCay.eachRow((dong, soDong) => {
    if (soDong <= 2) return;

    const ma = docChuoi(lay(dong, 'ma')).toLowerCase();
    if (!ma) return; // dòng trống

    const bao = (van_de: string) => loi.push({ dong: soDong, ma, van_de });

    if (maDaGap.has(ma)) bao(`mã "${ma}" bị lặp — mỗi loài phải có mã duy nhất`);
    maDaGap.add(ma);

    if (!/^[a-z0-9-]+$/.test(ma)) bao(`mã "${ma}" phải viết không dấu, chỉ gồm chữ thường và gạch ngang`);

    const nhom = docChuoi(lay(dong, 'nhom'));
    if (!NHOM_CAY.includes(nhom as never)) bao(`nhóm "${nhom}" không hợp lệ`);

    const anhSangToiThieu = docChuoi(lay(dong, 'anhSangToiThieu'));
    const anhSangLyTuong = docChuoi(lay(dong, 'anhSangLyTuong')) || anhSangToiThieu;
    if (!MUC_SANG.includes(anhSangToiThieu as never)) bao(`ánh sáng tối thiểu "${anhSangToiThieu}" không hợp lệ`);
    if (!MUC_SANG.includes(anhSangLyTuong as never)) bao(`ánh sáng lý tưởng "${anhSangLyTuong}" không hợp lệ`);
    if (MUC_SANG.indexOf(anhSangLyTuong as never) < MUC_SANG.indexOf(anhSangToiThieu as never)) {
      bao('ánh sáng lý tưởng không được thấp hơn ánh sáng tối thiểu');
    }

    const doAm = docChuoi(lay(dong, 'doAm'));
    if (!MUC_AM.includes(doAm as never)) bao(`độ ẩm "${doAm}" không hợp lệ`);

    const tuoiKho = docSo(lay(dong, 'chuKyTuoiMuaKho'));
    const tuoiMua = docSo(lay(dong, 'chuKyTuoiMuaMua')) ?? tuoiKho;
    if (!tuoiKho || tuoiKho < 1) bao('chu kỳ tưới mùa khô phải là số ngày lớn hơn 0');

    const doKho = docSo(lay(dong, 'doKho'));
    if (!doKho || doKho < 1 || doKho > 5) bao(`độ khó "${doKho}" phải nằm trong khoảng 1-5`);

    const menh = docChuoi(lay(dong, 'menhPhongThuy'));
    if (menh && !MENH.includes(menh as never)) bao(`mệnh "${menh}" không hợp lệ`);

    const congDung = docDanhSach(lay(dong, 'congDung'));
    const congDungLa = congDung.filter((c) => !CONG_DUNG.includes(c as never));
    if (congDungLa.length > 0) bao(`công dụng không hợp lệ: ${congDungLa.join(', ')}`);

    const nhomAnDuoc = ['rau ăn lá', 'rau gia vị', 'cây ăn quả mini'].includes(nhom);
    const ngayThuHoach = docSo(lay(dong, 'ngayThuHoach'));
    if (nhomAnDuoc && !ngayThuHoach) bao(`nhóm "${nhom}" phải có ngày thu hoạch`);

    banGhi.push({
      ma,
      tenVi: docChuoi(lay(dong, 'tenVi')),
      tenEn: docChuoi(lay(dong, 'tenEn')),
      tenKhoaHoc: docChuoi(lay(dong, 'tenKhoaHoc')),
      nhom,
      anhSangToiThieu,
      anhSangLyTuong,
      chuKyTuoiMuaKho: tuoiKho ?? 7,
      chuKyTuoiMuaMua: tuoiMua ?? tuoiKho ?? 7,
      doSauKiemTraDat: docSo(lay(dong, 'doSauKiemTraDat')) ?? 3,
      chuKyBonPhan: docSo(lay(dong, 'chuKyBonPhan')),
      chuKyThayDat: docSo(lay(dong, 'chuKyThayDat')),
      canPhunSuong: docBool(lay(dong, 'canPhunSuong')),
      nhietDoNgayMin: docSo(lay(dong, 'nhietDoNgayMin')) ?? 18,
      nhietDoNgayMax: docSo(lay(dong, 'nhietDoNgayMax')) ?? 30,
      nhietDoDemMin: docSo(lay(dong, 'nhietDoDemMin')) ?? 16,
      nhietDoDemMax: docSo(lay(dong, 'nhietDoDemMax')) ?? 24,
      doAm,
      anToanThuNuoi: docBool(lay(dong, 'anToanThuNuoi')),
      ghiChuDocTinh: docChuoi(lay(dong, 'ghiChuDocTinh')),
      doKho: doKho ?? 3,
      kichThuocChauCm: docSo(lay(dong, 'kichThuocChauCm')) ?? 20,
      khoangCachTrongCm: docSo(lay(dong, 'khoangCachTrongCm')),
      menhPhongThuy: menh || null,
      yNghiaPhongThuy: docChuoi(lay(dong, 'yNghiaPhongThuy')),
      ngayThuHoach,
      trongXenDuocVoi: docDanhSach(lay(dong, 'trongXenDuocVoi')),
      khongTrongCungVoi: docDanhSach(lay(dong, 'khongTrongCungVoi')),
      congDung,
      moTaNgan: docChuoi(lay(dong, 'moTaNgan')),
      huongDanChamSoc: docChuoi(lay(dong, 'huongDanChamSoc')),
      anhUrl: docChuoi(lay(dong, 'anhUrl')),
      dauHieuBenhThuongGap: benhTheoCay.get(ma) ?? [],
      daKiemChung: docBool(lay(dong, 'daKiemChung')),
    });
  });

  // ---- Kiểm tra tham chiếu chéo giữa các loài ----
  for (const bg of banGhi) {
    const ma = bg.ma as string;
    for (const truong of ['trongXenDuocVoi', 'khongTrongCungVoi']) {
      for (const maKhac of bg[truong] as string[]) {
        if (!maDaGap.has(maKhac)) {
          loi.push({ dong: 0, ma, van_de: `${truong} trỏ tới mã không tồn tại: "${maKhac}"` });
        }
      }
    }
  }

  if (loi.length > 0) {
    logger.error(`Tìm thấy ${loi.length} vấn đề — KHÔNG ghi gì vào cơ sở dữ liệu:`);
    for (const l of loi) {
      logger.error(`  dòng ${l.dong || '-'} [${l.ma}] ${l.van_de}`);
    }
    throw new Error('Dữ liệu chưa hợp lệ. Sửa tệp Excel rồi chạy lại.');
  }

  logger.log(`Đọc được ${banGhi.length} loài, không có lỗi.`);

  const chuaKiemChung = banGhi.filter((b) => !b.daKiemChung).length;
  if (chuaKiemChung > 0) {
    logger.warn(
      `${chuaKiemChung}/${banGhi.length} loài chưa được kiểm chứng. ` +
        'Đây là dữ liệu nháp — đội nội dung cần đối chiếu trước khi dùng thật.',
    );
  }

  if (chiThu) {
    logger.log('Chế độ thử: dừng tại đây, không ghi gì.');
    return;
  }

  // ---- Ghi vào cơ sở dữ liệu ----
  // Nạp động: chế độ --thu chỉ soát tệp Excel nên không cần biến môi trường.
  const { NestFactory } = await import('@nestjs/core');
  const { AppModule } = await import('../app.module');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const model = app.get<Model<PlantDocument>>(getModelToken(Plant.name));

    const ketQua = await model.bulkWrite(
      banGhi.map((bg) => ({
        updateOne: {
          filter: { ma: bg.ma },
          update: { $set: bg },
          upsert: true,
        },
      })),
    );

    logger.log(`Thêm mới: ${ketQua.upsertedCount} · Cập nhật: ${ketQua.modifiedCount}`);
    logger.log(`Tổng số loài hiện có: ${await model.countDocuments()}`);
  } finally {
    await app.close();
  }
}

chay().catch((e) => {
  console.error('\nNhập dữ liệu thất bại:', e.message);
  process.exit(1);
});
