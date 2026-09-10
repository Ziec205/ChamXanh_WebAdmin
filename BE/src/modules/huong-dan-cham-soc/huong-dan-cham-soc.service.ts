import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HuongDanChamSoc, HuongDanChamSocDocument } from './schemas/huong-dan-cham-soc.schema';
import { CapNhatHuongDanDto } from './dto/cap-nhat-huong-dan.dto';
import { HUONG_DAN_MAC_DINH } from './du-lieu/huong-dan-mac-dinh';
import { NhatKyService } from '../nhat-ky/nhat-ky.service';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@Injectable()
export class HuongDanChamSocService {
  private readonly logger = new Logger(HuongDanChamSocService.name);

  constructor(
    @InjectModel(HuongDanChamSoc.name) private readonly model: Model<HuongDanChamSocDocument>,
    private readonly nhatKy: NhatKyService,
  ) {}

  danhSach() {
    return this.model.find().exec();
  }

  async theoLoai(loai: string) {
    const hd = await this.model.findOne({ loai }).exec();
    if (!hd) throw new NotFoundException(`Chưa có hướng dẫn cho loại việc "${loai}".`);
    return hd;
  }

  async capNhat(loai: string, du_lieu: CapNhatHuongDanDto, nguoiDung: AuthenticatedUser) {
    delete du_lieu.loai;

    const truoc = await this.model.findOne({ loai }).lean().exec();
    if (!truoc) throw new NotFoundException(`Chưa có hướng dẫn cho loại việc "${loai}".`);

    const hd = await this.model.findOneAndUpdate({ loai }, { $set: du_lieu }, { new: true }).exec();

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
        hanhDong: 'sửa hướng dẫn chăm sóc',
        doiTuong: 'huong-dan-cham-soc',
        maDoiTuong: loai,
        truocKhi,
        sauKhi,
      });
    }

    return hd!;
  }

  async napMacDinh(): Promise<{ themMoi: number; boQua: number }> {
    let themMoi = 0;
    let boQua = 0;

    for (const hd of HUONG_DAN_MAC_DINH) {
      const daCo = await this.model.exists({ loai: hd.loai });
      if (daCo) {
        boQua++;
        continue;
      }
      await this.model.create(hd);
      themMoi++;
    }

    this.logger.log(`Hướng dẫn chăm sóc — thêm mới: ${themMoi}, đã có sẵn: ${boQua}`);
    return { themMoi, boQua };
  }
}
