import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaiViet, BaiVietDocument } from './schemas/bai-viet.schema';
import { CreateBaiVietDto } from './dto/create-bai-viet.dto';
import { UpdateBaiVietDto } from './dto/update-bai-viet.dto';
import { NhatKyService } from '../nhat-ky/nhat-ky.service';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@Injectable()
export class TrangGioiThieuService {
  constructor(
    @InjectModel(BaiViet.name) private readonly model: Model<BaiVietDocument>,
    private readonly nhatKy: NhatKyService,
  ) {}

  danhSach() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  async chiTiet(duongDan: string) {
    const muc = await this.model.findOne({ duongDan }).exec();
    if (!muc) throw new NotFoundException('Không tìm thấy bài viết.');
    return muc;
  }

  /** Danh mục công khai cho web giới thiệu — chỉ bài đã xuất bản. */
  danhSachDaXuatBan() {
    return this.model.find({ daXuatBan: true }).sort({ createdAt: -1 }).exec();
  }

  async chiTietDaXuatBan(duongDan: string) {
    const muc = await this.model.findOne({ duongDan, daXuatBan: true }).exec();
    if (!muc) throw new NotFoundException('Không tìm thấy bài viết.');
    return muc;
  }

  async taoMoi(du_lieu: CreateBaiVietDto, nguoiDung: AuthenticatedUser) {
    if (await this.model.exists({ duongDan: du_lieu.duongDan })) {
      throw new ConflictException(`Đường dẫn "${du_lieu.duongDan}" đã tồn tại.`);
    }
    const muc = await this.model.create(du_lieu);
    await this.nhatKy.ghi({
      nguoiDung,
      hanhDong: 'thêm bài viết trang giới thiệu',
      doiTuong: 'trang-gioi-thieu',
      maDoiTuong: muc.duongDan,
      sauKhi: du_lieu as unknown as Record<string, unknown>,
    });
    return muc;
  }

  async capNhat(duongDan: string, du_lieu: UpdateBaiVietDto, nguoiDung: AuthenticatedUser) {
    delete du_lieu.duongDan;

    const truoc = await this.model.findOne({ duongDan }).lean().exec();
    if (!truoc) throw new NotFoundException('Không tìm thấy bài viết.');

    const muc = await this.model
      .findOneAndUpdate({ duongDan }, { $set: du_lieu }, { new: true })
      .exec();

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
        hanhDong: 'sửa bài viết trang giới thiệu',
        doiTuong: 'trang-gioi-thieu',
        maDoiTuong: duongDan,
        truocKhi,
        sauKhi,
      });
    }

    return muc!;
  }

  async xoa(duongDan: string, nguoiDung: AuthenticatedUser) {
    const muc = await this.model.findOneAndDelete({ duongDan }).exec();
    if (!muc) throw new NotFoundException('Không tìm thấy bài viết.');
    await this.nhatKy.ghi({
      nguoiDung,
      hanhDong: 'xoá bài viết trang giới thiệu',
      doiTuong: 'trang-gioi-thieu',
      maDoiTuong: duongDan,
      truocKhi: muc.toObject() as unknown as Record<string, unknown>,
    });
    return { thanhCong: true };
  }
}
