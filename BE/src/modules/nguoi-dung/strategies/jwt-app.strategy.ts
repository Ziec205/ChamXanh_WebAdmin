import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { NguoiDungService } from '../nguoi-dung.service';
import type { AuthenticatedAppUser } from '../guards/current-app-user.decorator';

interface JwtAppPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtAppStrategy extends PassportStrategy(Strategy, 'jwt-app') {
  constructor(
    config: ConfigService,
    private readonly nguoiDungService: NguoiDungService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwtApp.accessSecret')!,
    });
  }

  async validate(payload: JwtAppPayload): Promise<AuthenticatedAppUser> {
    const nd = await this.nguoiDungService.chiTiet(payload.sub).catch(() => null);
    if (!nd || !nd.dangHoatDong) {
      throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị khoá.');
    }
    return { id: String(nd._id), email: nd.email };
  }
}
