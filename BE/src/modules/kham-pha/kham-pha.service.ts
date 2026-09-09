import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KhamPha, KhamPhaDocument } from './schemas/kham-pha.schema';
import { CreateKhamPhaDto } from './dto/create-kham-pha.dto';
import { UpdateKhamPhaDto } from './dto/update-kham-pha.dto';
import { NhatKyService } from '../nhat-ky/nhat-ky.service';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@Injectable()
export class KhamPhaService {
  constructor(
    @InjectModel(KhamPha.name) private readonly model: Model<KhamPhaDocument>,
    private readonly nhatKy: NhatKyService,
  ) {}

  danhSach() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  async chiTiet(id: string) {
    const muc = await this.model.findById(id).exec();
    if (!muc) throw new NotFoundException('Không tìm thấy khám phá.');
    return muc;
  }

  async taoMoi(du_lieu: CreateKhamPhaDto, nguoiDung: AuthenticatedUser) {
    const muc = await this.model.create(du_lieu);
    await this.nhatKy.ghi({
      nguoiDung,
      hanhDong: 'thêm nội dung khám phá',
      doiTuong: 'kham-pha',
      maDoiTuong: String(muc._id),
      sauKhi: du_lieu as unknown as Record<string, unknown>,
    });
    return muc;
  }

  async capNhat(id: string, du_lieu: UpdateKhamPhaDto, nguoiDung: AuthenticatedUser) {
    const truoc = await this.model.findById(id).lean().exec();
    if (!truoc) throw new NotFoundException('Không tìm thấy khám phá.');

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
        hanhDong: 'sửa nội dung khám phá',
        doiTuong: 'kham-pha',
        maDoiTuong: id,
        truocKhi,
        sauKhi,
      });
    }

    return muc!;
  }

  async xoa(id: string, nguoiDung: AuthenticatedUser) {
    const muc = await this.model.findByIdAndDelete(id).exec();
    if (!muc) throw new NotFoundException('Không tìm thấy khám phá.');
    await this.nhatKy.ghi({
      nguoiDung,
      hanhDong: 'xoá nội dung khám phá',
      doiTuong: 'kham-pha',
      maDoiTuong: id,
      truocKhi: muc.toObject() as unknown as Record<string, unknown>,
    });
    return { thanhCong: true };
  }
}
