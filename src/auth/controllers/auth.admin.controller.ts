import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import { AuthAdminService } from '../services/auth.admin.service';

@Controller('auth')
@ApiTags('auth')
export class AuthAdminController {
  constructor(private authService: AuthAdminService) {}

  @Post()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('reset-password-link')
  resetPasswordLink(@Body() dto: { email: string }) {
    return this.authService.resetPassword(dto.email);
  }

  @Post('verify-reset-password')
  verifyResetPasswordLink(@Body() dto: { email: string; token: string }) {
    return this.authService.verifyResetPwdToken(dto.email, dto.token);
  }

  @Post('verifyAcceptance')
  verifyAcceptance(@Body() dto: { token: string }) {
    return this.authService.verifyAcceptance(dto.token);
  }
}
