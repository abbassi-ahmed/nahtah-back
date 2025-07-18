import { Body, Controller, Post } from '@nestjs/common';
import { AuthUserService } from '../services/auth.user.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import { CreateUserDto } from 'src/users/dto/createUser.dto';

@Controller('auth-user')
@ApiTags('auth-user')
export class AuthUserController {
  constructor(private authService: AuthUserService) {}

  @Post()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('signup')
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
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
