import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from './entities/event.entity';
import { Model, Types } from 'mongoose';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import {
  findAllPaginated,
  PaginatedResult,
} from 'src/utils/generic/pagination';
import { CreateEventDto } from './dto/createEventDto';
import { UsersService } from 'src/users/services/users.service';
import { Gateway } from 'src/gateway/gateway';
import { SchedulerRegistry } from '@nestjs/schedule';
import * as cron from 'node-cron';
import * as moment from 'moment';
import { FirebaseService } from 'src/expo/expo.service';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => FirebaseService))
    private firbaseService: FirebaseService,
    private gateway: Gateway,
    private schedulerRegistry: SchedulerRegistry,
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

    if (eventCreated.client) {
      await this.firbaseService.sendNotificationsToRole(
        'admin',
        '✂️ حجز جديد للحلاقة',
        'تم إنشاء حجز حلاقة جديد، يُرجى مراجعته واتخاذ الإجراءات اللازمة.',
        'newEvent',
      );
    }

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
        status: { $in: ['ACCEPTED', 'PENDING', 'COMPLETED'] },
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
    status: 'ACCEPTED' | 'DECLINED' | 'PENDING' | 'COMPLETED',
  ) {
    const event = await this.eventModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();

    this.removeCronJob(id);

    switch (status) {
      case 'ACCEPTED': {
        const endDateTime = moment(
          `${event?.endDate} ${event?.endTime}`,
          'YYYY-MM-DD HH:mm',
        );
        Logger.warn('event accepted will start at', endDateTime.toDate());

        if (endDateTime.isAfter(moment())) {
          const completionCronExpression = `${endDateTime.minute()} ${endDateTime.hour()} ${endDateTime.date()} ${endDateTime.month() + 1} *`;

          const completionJob = cron.schedule(
            completionCronExpression,
            async () => {
              const currentEvent = await this.eventModel.findById(id);
              if (currentEvent?.status === 'ACCEPTED') {
                await this.eventModel.findByIdAndUpdate(id, {
                  status: 'COMPLETED',
                });

                if (currentEvent.client && !currentEvent.pointsAdded) {
                  await this.usersService.addPoints(
                    currentEvent.client._id.toString(),
                    currentEvent.points,
                  );
                  await this.markPointsAdded(id);
                }
              }
              this.removeCronJob(`${id}-completion`);
              this.removeCronJob(`${id}-reminder`);
            },
          );

          this.schedulerRegistry.addCronJob(
            `${id}-completion`,
            completionJob as any,
          );
          await completionJob.start();
          Logger.warn('completion job started');

          const reminderTime = endDateTime.clone().subtract(15, 'minutes');
          if (reminderTime.isAfter(moment())) {
            const reminderCronExpression = `${reminderTime.minute()} ${reminderTime.hour()} ${reminderTime.date()} ${reminderTime.month() + 1} *`;

            const reminderJob = cron.schedule(
              reminderCronExpression,
              async () => {
                const currentEvent = await this.eventModel.findById(id);
                if (
                  currentEvent?.status === 'ACCEPTED' &&
                  currentEvent.client
                ) {
                  await this.firbaseService.sendPushNotification(
                    currentEvent.client._id.toString(),
                    '⏰ تذكير بموعد الحلاقة',
                    'موعد حلاقتك بعد 15 دقيقة! نرجو الحضور في الوقت المحدد.',
                    'event',
                  );
                }
                this.removeCronJob(`${id}-reminder`);
              },
            );

            this.schedulerRegistry.addCronJob(
              `${id}-reminder`,
              reminderJob as any,
            );
            await reminderJob.start();
            Logger.warn('reminder job started');
          }
        }
        break;
      }

      case 'COMPLETED':
        if (event?.client && !event.pointsAdded) {
          await this.usersService.addPoints(
            event.client._id.toString(),
            event.points,
          );
          await this.markPointsAdded(id);
          await this.firbaseService.sendPushNotification(
            event.client._id.toString(),
            '💇‍♂️ تم الانتهاء من حجز الحلاقة',
            'تمت حلاقة شعرك بنجاح! شاركنا رأيك في الخدمة وساعدنا على تحسين تجربتك.',
            'event',
          );
        }
        break;

      case 'DECLINED':
        if (event?.client) {
          await this.firbaseService.sendPushNotification(
            event.client._id.toString(),
            '❌ تم إلغاء الحلاقة',
            'نعتذر، تم إلغاء حجزك للحلاقة. يرجى إعادة الحجز أو التواصل معنا للمساعدة.',
            'event',
          );
        }
        Logger.warn('jobs removed');
        this.removeCronJob(`${id}-completion`);
        this.removeCronJob(`${id}-reminder`);
        break;

      case 'PENDING':
        if (event?.client) {
          await this.firbaseService.sendPushNotification(
            event.client._id.toString(),
            '⏳ جاري تأكيد موعد الحلاقة',
            'تم استلام طلبك للحلاقة وسنقوم بتأكيده قريباً. شكراً لثقتك!',
            'event',
          );
        }
        Logger.warn('jobs removed');
        this.removeCronJob(`${id}-completion`);
        this.removeCronJob(`${id}-reminder`);
        break;
    }

    return event;
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
          status: 'COMPLETED',
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
        status: 'COMPLETED',
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

  async getEventsByDateAndTime(
    dateStart: string,
    dateEnd: string,
    timeStart: string,
    timeEnd: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Event>> {
    const filter = {
      startDate: { $gte: dateStart, $lte: dateEnd },
      $or: [
        { startTime: { $gte: timeStart, $lt: timeEnd } },
        { endTime: { $gt: timeStart, $lte: timeEnd } },
        { startTime: { $lte: timeStart }, endTime: { $gte: timeEnd } },
      ],
    };

    return findAllPaginated(
      this.eventModel,
      pagination,
      { path: 'client' },
      filter,
    );
  }

  async getEventsAcceptedAroundTime(date: Date): Promise<Event[]> {
    return this.eventModel
      .find({
        status: 'ACCEPTED',
        updatedAt: { $lte: date },
        pointsAdded: { $ne: true },
      })
      .exec();
  }
  async markPointsAdded(eventId: string) {
    return this.eventModel
      .findByIdAndUpdate(eventId, { pointsAdded: true })
      .exec();
  }

  private removeCronJob(id: string) {
    const cronExists = this.schedulerRegistry.doesExist('cron', id);
    if (cronExists) {
      this.schedulerRegistry.deleteCronJob(id);
    }
  }
}
