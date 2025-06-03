import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './entities/notification.entity';
import { Model } from 'mongoose';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async create(createNotificationDto: Notification) {
    const createdNotification = new this.notificationModel(
      createNotificationDto,
    );
    return await createdNotification.save();
  }

  async findAll() {
    return await this.notificationModel.find().exec();
  }
  async getByUserId(userId: string) {
    return this.notificationModel.find({ userId }).exec();
  }

  async findAllPaginated(
    pagination: PaginationDto,
  ): Promise<{ data: Notification[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = '_id',
      sortOrder = 'asc',
    } = pagination;
    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [data, total] = await Promise.all([
      this.notificationModel
        .find()
        .populate('client')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments().exec(),
    ]);

    return { data, total };
  }

  async findOne(id: number) {
    return await this.notificationModel.findById(id).exec();
  }

  async update(id: number, updateNotificationDto: Notification) {
    return await this.notificationModel
      .findByIdAndUpdate(id, updateNotificationDto, { new: true })
      .exec();
  }

  async remove(id: number) {
    return await this.notificationModel.findByIdAndDelete(id).exec();
  }
}
