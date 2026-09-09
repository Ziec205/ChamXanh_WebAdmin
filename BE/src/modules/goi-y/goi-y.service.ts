import { Injectable } from '@nestjs/common';
import { PlantsService } from '../plants/plants.service';
import { goiYCay, TRONG_SO_MAC_DINH, type KetQuaGoiY, type TrongSo } from './cham-diem';
import { suyRaHoSo, type CauTraLoiKhaoSat } from './suy-ra-the';
import { XinGoiYDto } from './dto/xin-goi-y.dto';

@Injectable()
export class GoiYService {
  constructor(private readonly plants: PlantsService) {}

  /**
   * Gợi ý cây từ câu trả lời khảo sát.
   *
   * Toàn bộ phần tính toán nằm trong hàm thuần goiYCay — service này chỉ lo
   * lấy dữ liệu và ghép kết quả, nhờ vậy thuật toán kiểm thử được mà không cần
   * dựng cơ sở dữ liệu.
   */
  async goiY(dto: XinGoiYDto, trongSo: TrongSo = TRONG_SO_MAC_DINH): Promise<
    KetQuaGoiY & { anhSangCoSan: string; tongSoLoaiXet: number }
  > {
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
    const danhMuc = await this.plants.danhMucDeGoiY();
    const ketQua = goiYCay(danhMuc, hoSo, dto.soLuong ?? 6, trongSo);

    return {
      ...ketQua,
      // Trả về mức sáng đã suy ra để giao diện giải thích được cho người dùng.
      anhSangCoSan: hoSo.anhSangCoSan,
      tongSoLoaiXet: danhMuc.length,
    };
  }
}
