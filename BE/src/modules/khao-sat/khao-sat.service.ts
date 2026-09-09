import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CauHoi, CauHoiDocument } from './schemas/cau-hoi.schema';
import { CAU_HOI_MAC_DINH } from './du-lieu/cau-hoi-mac-dinh';

@Injectable()
export class KhaoSatService {
  private readonly logger = new Logger(KhaoSatService.name);

  constructor(@InjectModel(CauHoi.name) private readonly model: Model<CauHoiDocument>) {}

  danhSach() {
    return this.model.find({ dangHienThi: true }).sort({ thuTu: 1 }).exec();
  }

  danhSachDayDu() {
    return this.model.find().sort({ thuTu: 1 }).exec();
  }

  async capNhat(khoa: string, du_lieu: Partial<CauHoi>) {
    // Khoá là hợp đồng với thuật toán gợi ý — không cho đổi qua đường cập nhật.
    delete du_lieu.khoa;

    const cauHoi = await this.model
      .findOneAndUpdate({ khoa }, { $set: du_lieu }, { new: true })
      .exec();
    if (!cauHoi) throw new NotFoundException(`Không tìm thấy câu hỏi có khoá "${khoa}".`);
    return cauHoi;
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
