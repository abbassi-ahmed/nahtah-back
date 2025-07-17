import { Module } from '@nestjs/common';
import { FirebaseService } from './expo.service';
import { PushNotificationController } from './expo.controller';

@Module({
  controllers: [PushNotificationController],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class ExpoModule {}
