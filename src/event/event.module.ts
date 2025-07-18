import { forwardRef, Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './entities/event.entity';
import { UsersModule } from 'src/users/users.module';
import { Gateway } from 'src/gateway/gateway';
import { ExpoModule } from 'src/expo/expo.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    forwardRef(() => UsersModule),
    forwardRef(() => ExpoModule),
  ],
  controllers: [EventController],
  providers: [EventService, Gateway],
  exports: [EventService],
})
export class EventModule {}
