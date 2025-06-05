import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OffDays } from './entities/off-day.entity';

@Injectable()
export class OffDaysService {
  constructor(
    @InjectModel(OffDays.name) private offDaysModel: Model<OffDays>,
  ) {}

  async create(createOffDaysDto: OffDays): Promise<OffDays> {
    const createdOffDay = new this.offDaysModel(createOffDaysDto);
    return createdOffDay.save();
  }

  async findByUserId(userId: string): Promise<OffDays[]> {
    return this.offDaysModel.find({ userId }).exec();
  }

  async findByDate(date: string): Promise<OffDays[]> {
    return this.offDaysModel.find({ date }).exec();
  }

  async findAll(): Promise<OffDays[]> {
    return await this.offDaysModel.find().exec();
  }

  async remove(id: string): Promise<OffDays | null> {
    return await this.offDaysModel.findByIdAndDelete(id).exec();
  }
}
