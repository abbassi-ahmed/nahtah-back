import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private jwtService: JwtService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    let payload;
    if (type === 'Bearer') {
      payload = await this.jwtService.decode(token);
    }
    Logger.log(
      `requested by ${
        payload?.email ? payload.email : 'unknown user'
      } method: ${request.method} , url:${request.url}`,
    );
    return next.handle();
  }
}
