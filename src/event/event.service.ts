import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from './entities/event.entity';
import { Model, Types } from 'mongoose';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { findAllPaginated } from 'src/utils/generic/pagination';
import { CreateEventDto } from './dto/createEventDto';
import { UsersService } from 'src/users/services/users.service';
import { Gateway } from 'src/gateway/gateway';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private gateway: Gateway,
  ) {}

  async create(event: CreateEventDto) {
    let clientId: Types.ObjectId | undefined;

    if (event.clientId) {
      const client = await this.usersService.findOneById(event.clientId);
      if (!client) {
        throw new Error('Client not found');
      }
      clientId = client._id as Types.ObjectId;
    }

    const eventCreated = await this.eventModel.create({
      ...event,
      ...(clientId && { client: clientId }),
    });

    this.gateway.emitEventToAll('newEvent', eventCreated);
    return eventCreated;
  }

  async countDocuments(): Promise<number> {
    return this.eventModel.countDocuments().exec();
  }

  async findAllPaginatedEvents(pagination: PaginationDto) {
    const filter = {
      ...(pagination.id && { client: pagination.id }),
      ...(pagination.status && { status: pagination.status }),
    };
    return findAllPaginated(
      this.eventModel,
      pagination,
      {
        path: 'client',
        select: '-__v -password -createdAt -updatedAt -type -position',
      },
      filter,
    );
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

  async findOne(id: string) {
    return await this.eventModel.findById(id).populate('client').exec();
  }

  async getEventByDate(today: string): Promise<any[]> {
    const [month, day, year] = today.split('-');
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    const events = await this.eventModel
      .find({
        startDate: formattedDate,
        status: { $in: ['ACCEPTED', 'PENDING'] },
      })
      .populate('client')
      .exec();

    return events;
  }

  async update(id: string, updateEventDto: CreateEventDto) {
    return await this.eventModel
      .findByIdAndUpdate(
        id,
        { ...updateEventDto, status: 'PENDING' },
        { new: true },
      )
      .populate('client')
      .exec();
  }

  async remove(id: number) {
    return await this.eventModel.findByIdAndDelete(id).exec();
  }

  async deleteAll(): Promise<void> {
    await this.eventModel.deleteMany({});
  }

  async updateFeedback(id: string, feedback: string, rate: number) {
    return await this.eventModel
      .findByIdAndUpdate(id, { feedback, rate }, { new: true })
      .exec();
  }

  async updateEventStatus(
    id: string,
    status: 'ACCEPTED' | 'DECLINED' | 'PENDING',
  ) {
    return await this.eventModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
  }

  async getEventsReviews(pagination: PaginationDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = '_id',
      sortOrder = 'asc',
      id,
    } = pagination;
    const skip = (page - 1) * limit;
    const sortOptions: Record<string, 'asc' | 'desc'> = {};
    sortOptions[sortBy] = sortOrder;

    const [reviews, total] = await Promise.all([
      this.eventModel
        .find({
          userId: id,
          status: 'ACCEPTED',
          rate: { $ne: null },
          feedback: { $ne: null },
        })
        .select('rate feedback')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.eventModel.countDocuments({
        userId: id,
        status: 'ACCEPTED',
        rate: { $ne: null },
        feedback: { $ne: null },
      }),
    ]);

    return {
      data: reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
