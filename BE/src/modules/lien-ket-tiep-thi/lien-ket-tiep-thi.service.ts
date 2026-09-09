import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LienKetTiepThi, LienKetTiepThiDocument } from './schemas/lien-ket.schema';
import { CreateLienKetDto } from './dto/create-lien-ket.dto';
import { UpdateLienKetDto } from './dto/update-lien-ket.dto';
import { NhatKyService } from '../nhat-ky/nhat-ky.service';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@Injectable()
export class LienKetTiepThiService {
  constructor(
    @InjectModel(LienKetTiepThi.name) private readonly model: Model<LienKetTiepThiDocument>,
    private readonly nhatKy: NhatKyService,
  ) {}

  danhSach() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  async chiTiet(id: string) {
    const muc = await this.model.findById(id).exec();
    if (!muc) throw new NotFoundException('Không tìm thấy liên kết tiếp thị.');
    return muc;
  }

  async taoMoi(du_lieu: CreateLienKetDto, nguoiDung: AuthenticatedUser) {
    const muc = await this.model.create(du_lieu);
    await this.nhatKy.ghi({
      nguoiDung,
      hanhDong: 'thêm liên kết tiếp thị',
      doiTuong: 'lien-ket-tiep-thi',
      maDoiTuong: String(muc._id),
      sauKhi: du_lieu as unknown as Record<string, unknown>,
    });
    return muc;
  }

  async capNhat(id: string, du_lieu: UpdateLienKetDto, nguoiDung: AuthenticatedUser) {
    const truoc = await this.model.findById(id).lean().exec();
    if (!truoc) throw new NotFoundException('Không tìm thấy liên kết tiếp thị.');

    const muc = await this.model.findByIdAndUpdate(id, { $set: du_lieu }, { new: true }).exec();

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
        hanhDong: 'sửa liên kết tiếp thị',
        doiTuong: 'lien-ket-tiep-thi',
        maDoiTuong: id,
        truocKhi,
        sauKhi,
      });
    }

    return muc!;
  }

  async xoa(id: string, nguoiDung: AuthenticatedUser) {
    const muc = await this.model.findByIdAndDelete(id).exec();
    if (!muc) throw new NotFoundException('Không tìm thấy liên kết tiếp thị.');
    await this.nhatKy.ghi({
      nguoiDung,
      hanhDong: 'xoá liên kết tiếp thị',
      doiTuong: 'lien-ket-tiep-thi',
      maDoiTuong: id,
      truocKhi: muc.toObject() as unknown as Record<string, unknown>,
    });
    return { thanhCong: true };
  }
}
