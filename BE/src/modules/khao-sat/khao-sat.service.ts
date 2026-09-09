import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CauHoi, CauHoiDocument } from './schemas/cau-hoi.schema';
import { CAU_HOI_MAC_DINH } from './du-lieu/cau-hoi-mac-dinh';
import { CapNhatCauHoiDto } from './dto/cap-nhat-cau-hoi.dto';
import { NhatKyService } from '../nhat-ky/nhat-ky.service';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@Injectable()
export class KhaoSatService {
  private readonly logger = new Logger(KhaoSatService.name);

  constructor(
    @InjectModel(CauHoi.name) private readonly model: Model<CauHoiDocument>,
    private readonly nhatKy: NhatKyService,
  ) {}

  danhSach() {
    return this.model.find({ dangHienThi: true }).sort({ thuTu: 1 }).exec();
  }

  danhSachDayDu() {
    return this.model.find().sort({ thuTu: 1 }).exec();
  }

  async capNhat(khoa: string, du_lieu: CapNhatCauHoiDto, nguoiDung: AuthenticatedUser) {
    // Khoá là hợp đồng với thuật toán gợi ý — không cho đổi qua đường cập nhật.
    delete du_lieu.khoa;

    const truoc = await this.model.findOne({ khoa }).lean().exec();
    if (!truoc) throw new NotFoundException(`Không tìm thấy câu hỏi có khoá "${khoa}".`);

    const cauHoi = await this.model
      .findOneAndUpdate({ khoa }, { $set: du_lieu }, { new: true })
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
        hanhDong: 'sửa câu hỏi khảo sát',
        doiTuong: 'khao-sat',
        maDoiTuong: khoa,
        truocKhi,
        sauKhi,
      });
    }

    return cauHoi!;
  }

  /**
   * Nạp bộ câu hỏi mặc định.
   * Chỉ thêm câu chưa có — không ghi đè nội dung Admin đã chỉnh sửa.
   */
  async napMacDinh(): Promise<{ themMoi: number; boQua: number }> {
    let themMoi = 0;
    let boQua = 0;

    for (const ch of CAU_HOI_MAC_DINH) {
      const daCo = await this.model.exists({ khoa: ch.khoa });
      if (daCo) {
        boQua++;
        continue;
      }
      await this.model.create({ ...ch, moTa: ch.moTa ?? '', dangHienThi: true });
      themMoi++;
    }

    this.logger.log(`Câu hỏi khảo sát — thêm mới: ${themMoi}, đã có sẵn: ${boQua}`);
    return { themMoi, boQua };
  }
}
