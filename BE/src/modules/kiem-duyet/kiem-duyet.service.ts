import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaoCao, BaoCaoDocument, TrangThaiBaoCao } from './schemas/bao-cao.schema';
import { XuLyBaoCaoDto } from './dto/xu-ly-bao-cao.dto';
import { NhatKyService } from '../nhat-ky/nhat-ky.service';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@Injectable()
export class KiemDuyetService {
  constructor(
    @InjectModel(BaoCao.name) private readonly model: Model<BaoCaoDocument>,
    private readonly nhatKy: NhatKyService,
  ) {}

  danhSach(loc: { trangThai?: TrangThaiBaoCao }) {
    const dieuKien: FilterQuery<BaoCaoDocument> = {};
    if (loc.trangThai) dieuKien.trangThai = loc.trangThai;
    return this.model.find(dieuKien).sort({ createdAt: -1 }).exec();
  }

  async xuLy(id: string, du_lieu: XuLyBaoCaoDto, nguoiDung: AuthenticatedUser) {
    const bc = await this.model
      .findByIdAndUpdate(
        id,
        { $set: { trangThai: du_lieu.trangThai, ghiChuXuLy: du_lieu.ghiChuXuLy ?? '' } },
        { new: true },
      )
      .exec();
    if (!bc) throw new NotFoundException('Không tìm thấy báo cáo.');

    await this.nhatKy.ghi({
      nguoiDung,
      hanhDong: 'xử lý báo cáo kiểm duyệt',
      doiTuong: 'kiem-duyet',
      maDoiTuong: id,
      sauKhi: { trangThai: du_lieu.trangThai, ghiChuXuLy: du_lieu.ghiChuXuLy ?? '' },
    });
    return bc;
  }
}
