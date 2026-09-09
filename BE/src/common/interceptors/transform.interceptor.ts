import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface PhanHoi<T> {
  thanhCong: true;
  duLieu: T;
}

/** Bọc mọi phản hồi thành công vào một hình dạng duy nhất. */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, PhanHoi<T>> {
  intercept(_: ExecutionContext, next: CallHandler): Observable<PhanHoi<T>> {
    return next.handle().pipe(map((duLieu) => ({ thanhCong: true as const, duLieu })));
  }
}
