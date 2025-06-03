import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthUserController } from './controllers/auth.user.controller';
import { AuthUserService } from './services/auth.user.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    UsersModule,
  ],
  controllers: [AuthUserController],
  providers: [AuthUserService],
  exports: [AuthUserService],
})
export class AuthModule {}
