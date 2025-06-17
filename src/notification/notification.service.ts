import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './entities/notification.entity';
import { Model } from 'mongoose';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { findAllPaginated } from 'src/utils/generic/pagination';

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

  async findAllPaginatedNotifications(pagination: PaginationDto) {
    return findAllPaginated(this.notificationModel, pagination);
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
