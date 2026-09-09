import { Injectable } from '@nestjs/common';
import { PlantsService } from '../plants/plants.service';
import { CauHinhService } from '../cau-hinh/cau-hinh.service';
import { goiYCay, type KetQuaGoiY, type TrongSo } from './cham-diem';
import { suyRaHoSo, type CauTraLoiKhaoSat } from './suy-ra-the';
import { XinGoiYDto } from './dto/xin-goi-y.dto';

export type KetQuaGoiYDayDu = KetQuaGoiY & {
  anhSangCoSan: string;
  tongSoLoaiXet: number;
  trongSoDaDung: TrongSo;
};

@Injectable()
export class GoiYService {
  constructor(
    private readonly plants: PlantsService,
    private readonly cauHinh: CauHinhService,
  ) {}

  /**
   * Gợi ý cây từ câu trả lời khảo sát.
   *
   * Phần tính toán nằm trong hàm thuần goiYCay — service này chỉ lấy dữ liệu
   * và trọng số rồi ghép kết quả, nhờ vậy thuật toán kiểm thử được mà không
   * cần dựng cơ sở dữ liệu.
   */
  async goiY(dto: XinGoiYDto): Promise<KetQuaGoiYDayDu> {
    const traLoi: CauTraLoiKhaoSat = {
      noiDat: dto.noiDat,
      huong: dto.huong,
      dienTich: dto.dienTich,
      kinhNghiem: dto.kinhNghiem,
      thoiGianRanh: dto.thoiGianRanh,
      mucDich: dto.mucDich ?? [],
      coThuNuoi: dto.coThuNuoi,
      mien: dto.mien,
      menh: dto.menh ?? null,
    };

    const hoSo = suyRaHoSo(traLoi);

    // Trọng số lấy từ app_config: Admin tinh chỉnh được mà không cần phát hành lại app.
    const [danhMuc, trongSo] = await Promise.all([
      this.plants.danhMucDeGoiY(),
      this.cauHinh.trongSoGoiY(),
    ]);

    const ketQua = goiYCay(danhMuc, hoSo, dto.soLuong ?? 6, trongSo);

    return {
      ...ketQua,
      // Trả về mức sáng đã suy ra để giao diện giải thích được cho người dùng.
      anhSangCoSan: hoSo.anhSangCoSan,
      tongSoLoaiXet: danhMuc.length,
      // Trả kèm trọng số để đội nội dung đối chiếu khi thử thuật toán.
      trongSoDaDung: trongSo,
    };
  }
}
