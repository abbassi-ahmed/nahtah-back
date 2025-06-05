import { Module } from '@nestjs/common';
import { OffDaysService } from './off-day.service';
import { OffDaysController } from './off-day.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { OffDays, OffDaysSchema } from './entities/off-day.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: OffDays.name, schema: OffDaysSchema }]),
  ],
  controllers: [OffDaysController],
  providers: [OffDaysService],
  exports: [OffDaysService],
})
export class OffDayModule {}
