import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OffDays } from './entities/off-day.entity';
import { CreateOffDaysDto } from './dto/createOffDays.dto';

@Injectable()
export class OffDaysService {
  constructor(
    @InjectModel(OffDays.name) private offDaysModel: Model<OffDays>,
  ) {}

  async create(createOffDaysDto: CreateOffDaysDto): Promise<OffDays> {
    const alreadyExist = await this.offDaysModel.findOne({
      userId: createOffDaysDto.userId,
      date: createOffDaysDto.date,
    });

    if (alreadyExist) {
      throw new Error('Off day already exist');
    }
    const createdOffDay = new this.offDaysModel(createOffDaysDto);
    return createdOffDay.save();
  }

  async findByIdsAndDate(
    ids: string[],
    date: string,
  ): Promise<OffDays[] | null> {
    return await this.offDaysModel.find({ userId: { $in: ids }, date }).exec();
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
  async deleteAll(): Promise<void> {
    await this.offDaysModel.deleteMany({});
  }
}
