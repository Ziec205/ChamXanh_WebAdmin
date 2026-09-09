import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Plant, PlantDocument } from './schemas/plant.schema';
import { QueryPlantDto } from './dto/query-plant.dto';
import type { CayDeChamDiem } from '../goi-y/cham-diem';
import { NhatKyService } from '../nhat-ky/nhat-ky.service';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@Injectable()
export class PlantsService {
  constructor(
    @InjectModel(Plant.name) private readonly model: Model<PlantDocument>,
    private readonly nhatKy: NhatKyService,
  ) {}

  async danhSach(q: QueryPlantDto) {
    const dieuKien: FilterQuery<PlantDocument> = {};
    if (q.tim) dieuKien.tenVi = { $regex: q.tim, $options: 'i' };
    if (q.nhom) dieuKien.nhom = q.nhom;
    if (q.daKiemChung !== undefined) dieuKien.daKiemChung = q.daKiemChung;

    const trang = q.trang ?? 1;
    const moiTrang = q.moiTrang ?? 20;

    const [muc, tong] = await Promise.all([
      this.model
        .find(dieuKien)
        .sort({ tenVi: 1 })
        .skip((trang - 1) * moiTrang)
        .limit(moiTrang)
        .exec(),
      this.model.countDocuments(dieuKien),
    ]);

    return { muc, tong, trang, moiTrang, soTrang: Math.ceil(tong / moiTrang) };
  }

  async theoMa(ma: string) {
    const cay = await this.model.findOne({ ma: ma.toLowerCase() }).exec();
    if (!cay) throw new NotFoundException(`Không tìm thấy loài cây có mã "${ma}".`);
    return cay;
  }

  async taoMoi(du_lieu: Partial<Plant>, nguoiDung: AuthenticatedUser) {
    if (await this.model.exists({ ma: du_lieu.ma })) {
      throw new ConflictException(`Mã "${du_lieu.ma}" đã tồn tại.`);
    }
    const cay = await this.model.create(du_lieu);

    await this.nhatKy.ghi({
      nguoiDung,
      hanhDong: 'thêm loài cây',
      doiTuong: 'cay-trong',
      maDoiTuong: cay.ma,
      sauKhi: { tenVi: cay.tenVi, nhom: cay.nhom },
    });

    return cay;
  }

  async capNhat(ma: string, du_lieu: Partial<Plant>, nguoiDung: AuthenticatedUser) {
    // Mã là khoá liên kết với trongXenDuocVoi của loài khác — đổi là đứt tham chiếu.
    delete du_lieu.ma;

    const truoc = await this.model.findOne({ ma: ma.toLowerCase() }).lean().exec();
    if (!truoc) throw new NotFoundException(`Không tìm thấy loài cây có mã "${ma}".`);

    const cay = await this.model
      .findOneAndUpdate({ ma: ma.toLowerCase() }, { $set: du_lieu }, { new: true })
      .exec();

    // Chỉ ghi lại những trường thật sự đổi giá trị, không chép cả document.
    const truocKhi: Record<string, unknown> = {};
    const sauKhi: Record<string, unknown> = {};
    for (const truong of Object.keys(du_lieu)) {
      const cu = (truoc as Record<string, unknown>)[truong];
      const moi = (du_lieu as Record<string, unknown>)[truong];
      if (JSON.stringify(cu) !== JSON.stringify(moi)) {
        truocKhi[truong] = cu;
        sauKhi[truong] = moi;
      }
    }

    if (Object.keys(sauKhi).length > 0) {
      await this.nhatKy.ghi({
        nguoiDung,
        hanhDong: 'sửa loài cây',
        doiTuong: 'cay-trong',
        maDoiTuong: ma.toLowerCase(),
        truocKhi,
        sauKhi,
      });
    }

    return cay!;
  }

  /**
   * Lấy danh mục để chấm điểm.
   *
   * Chỉ lấy loài đang hiển thị, và chỉ lấy đúng những trường bộ chấm điểm cần —
   * không kéo cả mô tả và hướng dẫn chăm sóc về chỉ để xếp hạng.
   */
  async danhMucDeGoiY(): Promise<CayDeChamDiem[]> {
    return this.model
      .find({ dangHienThi: true })
      .select(
        'ma tenVi anhSangToiThieu anhSangLyTuong chuKyTuoiMuaKho chuKyTuoiMuaMua ' +
          'doKho kichThuocChauCm anToanThuNuoi congDung menhPhongThuy',
      )
      .lean<CayDeChamDiem[]>()
      .exec();
  }

  thongKe() {
    return this.model.aggregate([
      {
        $group: {
          _id: null,
          tong: { $sum: 1 },
          daKiemChung: { $sum: { $cond: ['$daKiemChung', 1, 0] } },
          dangHienThi: { $sum: { $cond: ['$dangHienThi', 1, 0] } },
          anToanThuNuoi: { $sum: { $cond: ['$anToanThuNuoi', 1, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ]);
  }
}
