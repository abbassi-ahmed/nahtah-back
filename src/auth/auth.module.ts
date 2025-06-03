import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthUserController } from './controllers/auth.user.controller';
import { AuthUserService } from './services/auth.user.service';
import { UsersModule } from 'src/users/users.module';
import { AdminsModule } from 'src/admins/admins.module';
import { AuthAdminService } from './services/auth.admin.service';
import { AuthAdminController } from './controllers/auth.admin.controller';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    UsersModule,
    AdminsModule,
  ],
  controllers: [AuthUserController, AuthAdminController],
  providers: [AuthUserService, AuthAdminService],
  exports: [AuthUserService, AuthAdminService],
})
export class AuthModule {}
