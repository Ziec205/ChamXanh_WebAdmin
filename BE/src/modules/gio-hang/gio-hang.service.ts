import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GioHang, GioHangDocument } from './schemas/gio-hang.schema';
import { ThemVaoGioHangDto } from './dto/them-vao-gio-hang.dto';

@Injectable()
export class GioHangService {
  constructor(@InjectModel(GioHang.name) private readonly model: Model<GioHangDocument>) {}

  async cuaToi(nguoiDungId: string) {
    const gh = await this.timHoacTaoGio(nguoiDungId);
    return gh.populate('mucList.sanPhamId', 'ten gia hinhAnh tonKho dangBan');
  }

  private async timHoacTaoGio(nguoiDungId: string) {
    const nguoiDungOid = new Types.ObjectId(nguoiDungId);
    let gh = await this.model.findOne({ nguoiDungId: nguoiDungOid }).exec();
    if (!gh) gh = await this.model.create({ nguoiDungId: nguoiDungOid, mucList: [] });
    return gh;
  }

  async themVao(nguoiDungId: string, dto: ThemVaoGioHangDto) {
    const gh = await this.timHoacTaoGio(nguoiDungId);
    const soLuong = dto.soLuong ?? 1;
    const muc = gh.mucList.find((m) => String(m.sanPhamId) === dto.sanPhamId);
    if (muc) {
      muc.soLuong += soLuong;
    } else {
      gh.mucList.push({ sanPhamId: new Types.ObjectId(dto.sanPhamId), soLuong });
    }
    await gh.save();
    return gh.populate('mucList.sanPhamId', 'ten gia hinhAnh tonKho dangBan');
  }

  async capNhatSoLuong(nguoiDungId: string, sanPhamId: string, soLuong: number) {
    const gh = await this.timHoacTaoGio(nguoiDungId);
    const muc = gh.mucList.find((m) => String(m.sanPhamId) === sanPhamId);
    if (!muc) throw new NotFoundException('Không tìm thấy sản phẩm này trong giỏ.');
    muc.soLuong = soLuong;
    await gh.save();
    return gh.populate('mucList.sanPhamId', 'ten gia hinhAnh tonKho dangBan');
  }

  async xoaMuc(nguoiDungId: string, sanPhamId: string) {
    const gh = await this.timHoacTaoGio(nguoiDungId);
    const truoc = gh.mucList.length;
    gh.mucList = gh.mucList.filter((m) => String(m.sanPhamId) !== sanPhamId) as typeof gh.mucList;
    if (gh.mucList.length === truoc) throw new NotFoundException('Không tìm thấy sản phẩm này trong giỏ.');
    await gh.save();
    return gh.populate('mucList.sanPhamId', 'ten gia hinhAnh tonKho dangBan');
  }

  /** Xoá sạch giỏ — gọi sau khi đặt đơn thành công. */
  async lamRong(nguoiDungId: string) {
    await this.model.updateOne({ nguoiDungId: new Types.ObjectId(nguoiDungId) }, { $set: { mucList: [] } }).exec();
  }
}
