import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './entities/notification.entity';
import { Model } from 'mongoose';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { findAllPaginated } from 'src/utils/generic/pagination';
import { CreateNotificationDto } from './dto/createNotificationDto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
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

  async findNumberOfNotifications({ id }: { id: string }) {
    const filter = id
      ? {
          $or: [{ client: id }, { client: null }],
          viewedBy: { $ne: id },
        }
      : {};
    return this.notificationModel.countDocuments(filter).exec();
  }

  async findAllPaginatedNotifications(pagination: PaginationDto) {
    const filter = pagination.id
      ? {
          $or: [{ client: pagination.id }, { client: null }],
        }
      : {};
    return findAllPaginated(
      this.notificationModel,
      pagination,
      undefined,
      filter,
    );
  }
  async findOne(id: number) {
    return await this.notificationModel.findById(id).exec();
  }

  async markAsViewed(userId: string, notificationIds: string[]) {
    return await this.notificationModel.updateMany(
      {
        _id: { $in: notificationIds },
        viewedBy: { $ne: userId },
      },
      {
        $addToSet: { viewedBy: userId },
      },
    );
  }

  async update(id: number, updateNotificationDto: Notification) {
    return await this.notificationModel
      .findByIdAndUpdate(id, updateNotificationDto, { new: true })
      .exec();
  }

  async remove(id: number) {
    return await this.notificationModel.findByIdAndDelete(id).exec();
  }

  async deleteAll(): Promise<void> {
    await this.notificationModel.deleteMany({});
  }
}
