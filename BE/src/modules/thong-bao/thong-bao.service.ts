import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expo, type ExpoPushMessage } from 'expo-server-sdk';
import { ViecChamSoc, ViecChamSocDocument } from '../vuon/schemas/viec-cham-soc.schema';
import { NguoiDungService } from '../nguoi-dung/nguoi-dung.service';
import { gomNhacNhoTheoNguoiDung, locViecDenHan, type ViecDeNhac } from './gom-nhac-nho';

@Injectable()
export class ThongBaoService {
  private readonly logger = new Logger(ThongBaoService.name);
  private readonly expo = new Expo();

  constructor(
    @InjectModel(ViecChamSoc.name) private readonly viecModel: Model<ViecChamSocDocument>,
    private readonly nguoiDungService: NguoiDungService,
  ) {}

  /** 7 giờ sáng mỗi ngày, giờ Việt Nam (UTC+7) — 0h UTC. */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async guiNhacNhoHangNgay(): Promise<void> {
    const soDaGui = await this.chayNhacNhoHangNgay(new Date());
    this.logger.log(`Đã gửi nhắc nhở chăm sóc cho ${soDaGui} người dùng.`);
  }

  /** Tách riêng khỏi @Cron để gọi trực tiếp được trong test, không cần chờ lịch. */
  async chayNhacNhoHangNgay(homNay: Date): Promise<number> {
    const tatCaViec = await this.viecModel
      .find()
      .populate<{ cayCuaToiId: { tenGoi?: string } | null }>('cayCuaToiId', 'tenGoi')
      .exec();

    const viecDeNhac: ViecDeNhac[] = tatCaViec.map((v) => ({
      nguoiDungId: String(v.nguoiDungId),
      loai: v.loai,
      hanKeTiep: v.hanKeTiep,
      tenCay: v.cayCuaToiId?.tenGoi ?? 'Một cây trong vườn',
    }));

    const denHan = locViecDenHan(viecDeNhac, homNay);
    const nhacNho = gomNhacNhoTheoNguoiDung(denHan);
    if (nhacNho.length === 0) return 0;

    const nguoiDungCoToken = await this.nguoiDungService.danhSachCoPushToken();
    const tokenTheoId = new Map(nguoiDungCoToken.map((nd) => [String(nd._id), nd.expoPushToken]));

    const messages: ExpoPushMessage[] = [];
    for (const nhac of nhacNho) {
      const token = tokenTheoId.get(nhac.nguoiDungId);
      if (!token || !Expo.isExpoPushToken(token)) continue;
      messages.push({
        to: token,
        sound: 'default',
        title: nhac.tieuDe,
        body: nhac.noiDung,
        data: { soViec: nhac.soViec },
      });
    }

    if (messages.length === 0) return 0;

    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (e) {
        // Gửi thông báo hỏng KHÔNG được làm hỏng chu trình — chỉ log rồi bỏ qua chunk đó.
        this.logger.error('Gửi Expo Push thất bại cho một lô', e as Error);
      }
    }
    return messages.length;
  }
}
