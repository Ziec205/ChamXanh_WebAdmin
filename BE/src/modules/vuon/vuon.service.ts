import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CayCuaToi, CayCuaToiDocument } from './schemas/cay-cua-toi.schema';
import { ViecChamSoc, ViecChamSocDocument } from './schemas/viec-cham-soc.schema';
import { ThemCayVaoVuonDto } from './dto/them-cay.dto';
import { PlantsService } from '../plants/plants.service';
import { sinhLichChamSoc, type CayDeSinhLich, type NgoiCanh } from '../lich-cham-soc/sinh-lich';

@Injectable()
export class VuonService {
  constructor(
    @InjectModel(CayCuaToi.name) private readonly cayModel: Model<CayCuaToiDocument>,
    @InjectModel(ViecChamSoc.name) private readonly viecModel: Model<ViecChamSocDocument>,
    private readonly plantsService: PlantsService,
  ) {}

  async themCay(nguoiDungId: string, dto: ThemCayVaoVuonDto) {
    // Ném NotFoundException nếu mã cây không tồn tại trong danh mục.
    const loaiCay = await this.plantsService.theoMa(dto.maCay);

    const ngayThem = new Date();
    const cay = await this.cayModel.create({
      nguoiDungId: new Types.ObjectId(nguoiDungId),
      maCay: loaiCay.ma,
      tenGoi: dto.tenGoi ?? loaiCay.tenVi,
      mien: dto.mien,
      noiDat: dto.noiDat,
      ngayThem,
    });

    const cayDeSinhLich: CayDeSinhLich = {
      ma: loaiCay.ma,
      chuKyTuoiMuaKho: loaiCay.chuKyTuoiMuaKho,
      chuKyTuoiMuaMua: loaiCay.chuKyTuoiMuaMua,
      chuKyBonPhan: loaiCay.chuKyBonPhan,
      chuKyThayDat: loaiCay.chuKyThayDat,
      canPhunSuong: loaiCay.canPhunSuong,
      doSauKiemTraDat: loaiCay.doSauKiemTraDat,
    };
    const ngoiCanh: NgoiCanh = { mien: dto.mien, noiDat: dto.noiDat, moc: ngayThem };

    const danhSachViec = sinhLichChamSoc(cayDeSinhLich, ngoiCanh);
    await this.viecModel.insertMany(
      danhSachViec.map((v) => ({
        nguoiDungId: new Types.ObjectId(nguoiDungId),
        cayCuaToiId: cay._id,
        loai: v.loai,
        chuKyNgay: v.chuKyNgay,
        hanKeTiep: v.hanDauTien,
        huongDan: v.huongDan,
        hoanThanhLanCuoi: null,
      })),
    );

    return cay;
  }

  danhSachCay(nguoiDungId: string) {
    return this.cayModel
      .find({ nguoiDungId: new Types.ObjectId(nguoiDungId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async chiTiet(nguoiDungId: string, id: string) {
    const cay = await this.cayModel
      .findOne({ _id: id, nguoiDungId: new Types.ObjectId(nguoiDungId) })
      .exec();
    if (!cay) throw new NotFoundException('Không tìm thấy cây này trong vườn của bạn.');
    return cay;
  }

  async xoaCay(nguoiDungId: string, id: string) {
    const cay = await this.chiTiet(nguoiDungId, id);
    await Promise.all([
      this.cayModel.deleteOne({ _id: cay._id }).exec(),
      this.viecModel.deleteMany({ cayCuaToiId: cay._id }).exec(),
    ]);
    return { thanhCong: true };
  }

  /** Toàn bộ việc chăm sóc của người dùng, gộp mọi cây, sắp theo hạn gần nhất trước. */
  danhSachViec(nguoiDungId: string) {
    return this.viecModel
      .find({ nguoiDungId: new Types.ObjectId(nguoiDungId) })
      .sort({ hanKeTiep: 1 })
      .populate('cayCuaToiId', 'tenGoi maCay')
      .exec();
  }

  async hoanThanhViec(nguoiDungId: string, id: string) {
    const viec = await this.viecModel
      .findOne({ _id: id, nguoiDungId: new Types.ObjectId(nguoiDungId) })
      .exec();
    if (!viec) throw new NotFoundException('Không tìm thấy việc chăm sóc này.');

    const bayGio = new Date();
    // Dời hạn tiếp theo từ NGÀY HOÀN THÀNH, không phải từ hạn cũ — tránh dồn
    // việc dội lại liên tiếp nếu người dùng hoàn thành trễ nhiều ngày.
    const hanKeTiep = new Date(bayGio);
    hanKeTiep.setDate(hanKeTiep.getDate() + viec.chuKyNgay);

    viec.hoanThanhLanCuoi = bayGio;
    viec.hanKeTiep = hanKeTiep;
    await viec.save();
    return viec;
  }
}
