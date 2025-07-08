import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { UserSchema, User } from './entities/user.entity';
import { AdminsController } from './controllers/admin.controller';
import { AdminsService } from './services/admin.service';
import { Gateway } from 'src/gateway/gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController, AdminsController],
  providers: [UsersService, AdminsService, Gateway],
  exports: [UsersService, AdminsService],
})
export class UsersModule {}
