import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/create-store.dto';
import { TTimeSlot } from 'src/types/timeSlot';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storeService.create({
      timeOpen: createStoreDto.timeOpen,
      timeClose: createStoreDto.timeClose,
    });
  }

  @Post('date')
  async getByDate(@Body() body: { date: string }): Promise<TTimeSlot[]> {
    const result = await this.storeService.getByDate(body.date);
    return result.AllTimes;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storeService.update(id, updateStoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storeService.remove(id);
  }

  @Delete()
  removeAll() {
    return this.storeService.removeAll();
  }
}
