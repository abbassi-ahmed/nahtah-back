import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private jwtService: JwtService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    let payload;
    if (type === 'Bearer') {
      payload = await this.jwtService.decode(token);
    }
    Logger.error(
      `requested by ${
        payload?.email ? payload.email : 'unknown user'
      }, HTTP method : ${request.method} , URL : ${
        request.url
      }, HTTP Status: ${status}, Error Message: ${(exception as any).message}`,
    );
    console.error(exception);

    response.status(status).json({
      statusCode: status,
      message: (exception as any).message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
