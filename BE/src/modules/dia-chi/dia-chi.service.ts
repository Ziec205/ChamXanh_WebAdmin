import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DiaChi, DiaChiDocument } from './schemas/dia-chi.schema';
import { TaoDiaChiDto } from './dto/tao-dia-chi.dto';
import { CapNhatDiaChiDto } from './dto/cap-nhat-dia-chi.dto';

@Injectable()
export class DiaChiService {
  constructor(@InjectModel(DiaChi.name) private readonly model: Model<DiaChiDocument>) {}

  danhSach(nguoiDungId: string) {
    return this.model
      .find({ nguoiDungId: new Types.ObjectId(nguoiDungId) })
      .sort({ macDinh: -1, createdAt: -1 })
      .exec();
  }

  async chiTiet(nguoiDungId: string, id: string) {
    const dc = await this.model.findOne({ _id: id, nguoiDungId: new Types.ObjectId(nguoiDungId) }).exec();
    if (!dc) throw new NotFoundException('Không tìm thấy địa chỉ.');
    return dc;
  }

  async taoMoi(nguoiDungId: string, dto: TaoDiaChiDto) {
    const nguoiDungOid = new Types.ObjectId(nguoiDungId);
    if (dto.macDinh) {
      await this.model.updateMany({ nguoiDungId: nguoiDungOid }, { $set: { macDinh: false } }).exec();
    }
    return this.model.create({ ...dto, nguoiDungId: nguoiDungOid });
  }

  async capNhat(nguoiDungId: string, id: string, dto: CapNhatDiaChiDto) {
    const nguoiDungOid = new Types.ObjectId(nguoiDungId);
    if (dto.macDinh) {
      await this.model.updateMany({ nguoiDungId: nguoiDungOid }, { $set: { macDinh: false } }).exec();
    }
    const dc = await this.model
      .findOneAndUpdate({ _id: id, nguoiDungId: nguoiDungOid }, { $set: dto }, { new: true })
      .exec();
    if (!dc) throw new NotFoundException('Không tìm thấy địa chỉ.');
    return dc;
  }

  async xoa(nguoiDungId: string, id: string) {
    const ketQua = await this.model
      .deleteOne({ _id: id, nguoiDungId: new Types.ObjectId(nguoiDungId) })
      .exec();
    if (ketQua.deletedCount === 0) throw new NotFoundException('Không tìm thấy địa chỉ.');
    return { thanhCong: true };
  }
}
