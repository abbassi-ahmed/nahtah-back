import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from './entities/event.entity';
import { Model } from 'mongoose';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

@Injectable()
export class EventService {
  constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}

  async create(Event: Event): Promise<Event> {
    const createdUser = new this.eventModel(Event);
    return createdUser.save();
  }

  async findAllPaginated(
    pagination: PaginationDto,
  ): Promise<{ data: Event[]; total: number }> {
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
      this.eventModel
        .find()
        .populate('client')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.eventModel.countDocuments().exec(),
    ]);

    return { data, total };
  }
  async countDocuments(): Promise<number> {
    return this.eventModel.countDocuments().exec();
  }

  async updateStatus(
    id: string,
    status: true | false | null,
  ): Promise<Event | null> {
    return this.eventModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('client')
      .exec();
  }

  async getByStatus(status: boolean | null): Promise<Event[]> {
    return await this.eventModel.find({ status }).populate('client').exec();
  }

  async getByClientId(clientId: string): Promise<Event[]> {
    return this.eventModel.find({ clientId }).exec();
  }

  async findAll() {
    return await this.eventModel.find().populate('client').exec();
  }

  async findOne(id: number) {
    return await this.eventModel.findById(id).populate('client').exec();
  }

  async getEventByDate(today: string) {
    const regex = new RegExp(today.slice(0, 10), 'i');
    return await this.eventModel
      .find({ start: { $regex: regex }, status: { $ne: false } })
      .populate('client')
      .exec();
  }

  async update(id: number, updateEventDto: Event) {
    return await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .populate('client')
      .exec();
  }

  async remove(id: number) {
    return await this.eventModel.findByIdAndDelete(id).exec();
  }

  async deleteAll(): Promise<void> {
    await this.eventModel.deleteMany({});
  }
}
