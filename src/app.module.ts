import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './utils/interceptors/logger.interceptor';
import { AllExceptionsFilter } from './utils/exceptions/exception.filter';
import { join } from 'path';
import { EventModule } from './event/event.module';
import { NotificationModule } from './notification/notification.module';
import { StoreModule } from './store/store.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { OffDayModule } from './off-day/off-day.module';
import { GatewayModule } from './gateway/gateway.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventPointsTask } from './tasks/event-points.task';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(
      'mongodb+srv://abbassi2002ahmed4:aekxX0xcOzMAhOwr@nahtahdb.i8lrmnz.mongodb.net/?retryWrites=true&w=majority&appName=nahtahdb',
    ),
    UsersModule,
    AuthModule,
    EventModule,
    NotificationModule,
    StoreModule,
    NewsletterModule,
    OffDayModule,
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    EventPointsTask,
  ],
})
export class AppModule {}
