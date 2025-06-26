// src/off-days/off-days.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OffDaysService } from './off-day.service';
import { OffDays } from './entities/off-day.entity';
import { CreateOffDaysDto } from './dto/createOffDays.dto';

@Controller('off-days')
export class OffDaysController {
  constructor(private readonly offDaysService: OffDaysService) {}

  @Post()
  async create(@Body() createOffDaysDto: CreateOffDaysDto): Promise<OffDays> {
    return this.offDaysService.create(createOffDaysDto);
  }

  @Get()
  async findAll(): Promise<OffDays[]> {
    return this.offDaysService.findAll();
  }

  @Post('findByIdsAndDate')
  async findByIdsAndDate(
    @Body() body: { ids: string[]; date: string },
  ): Promise<OffDays[] | null> {
    return this.offDaysService.findByIdsAndDate(body.ids, body.date);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<OffDays[]> {
    return this.offDaysService.findByUserId(userId);
  }

  @Get('date/:date')
  async findByDate(@Param('date') date: string): Promise<OffDays[]> {
    return this.offDaysService.findByDate(date);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<OffDays | null> {
    return this.offDaysService.remove(id);
  }

  @Delete()
  removeAll() {
    return this.offDaysService.deleteAll();
  }
}
