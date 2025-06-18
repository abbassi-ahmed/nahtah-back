import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from './entities/event.entity';
import { Model } from 'mongoose';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { findAllPaginated } from 'src/utils/generic/pagination';
import { CreateEventDto } from './dto/createEventDto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async create(event: CreateEventDto) {
    const client = await this.usersService.findOneById(event.clientId);
    if (!client) {
      throw new Error('Client not found');
    }
    return this.eventModel.create({
      ...event,
      client,
    });
  }

  async countDocuments(): Promise<number> {
    return this.eventModel.countDocuments().exec();
  }

  async findAllPaginatedEvents(pagination: PaginationDto) {
    return findAllPaginated(this.eventModel, pagination);
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
