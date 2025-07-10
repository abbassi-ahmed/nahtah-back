import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Store } from './entities/store.entity';
import { CreateStoreDto, UpdateStoreDto } from './dto/create-store.dto';
import { TTimeSlot } from 'src/types/timeSlot';
import { EventService } from 'src/event/event.service';
import {
  generateTimeSlots,
  parseStoreTime,
  validateAndAdjustTimes,
} from 'src/utils/timeStore';

@Injectable()
export class StoreService {
  constructor(
    @InjectModel(Store.name) private storeModel: Model<Store>,
    @Inject(forwardRef(() => EventService))
    private eventService: EventService,
  ) {}

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const { timeOpen, timeClose } = createStoreDto;

    await this.storeModel.deleteMany().exec();
    let openTime: Date;
    let closeTime: Date;

    if (!timeOpen || !timeClose) {
      openTime = parseStoreTime('00:00:00');
      closeTime = parseStoreTime('23:59:59');
    } else {
      openTime = parseStoreTime(timeOpen);
      closeTime = parseStoreTime(timeClose);
      validateAndAdjustTimes(openTime, closeTime);
    }

    const storeData = {
      timeOpen: openTime,
      timeClose: closeTime,
    };

    try {
      const createdStore = new this.storeModel(storeData);
      return await createdStore.save();
    } catch (error) {
      throw new Error(`Failed to create store: ${error.message}`);
    }
  }

  async getStore(): Promise<Store | null> {
    const [store] = await this.storeModel.find().limit(1).exec();
    if (!store) return null;
    return store;
  }

  async getByDate(
    date: string,
    userId: string,
  ): Promise<{ AllTimes: TTimeSlot[] }> {
    const [store] = await this.storeModel.find().limit(1).exec();
    if (!store) return { AllTimes: [] };

    const events = await this.eventService.getEventByDate(date);
    const slots = generateTimeSlots(store.timeOpen, store.timeClose);

    const now = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }),
    );
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

    const requestedDate = new Date(date);
    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    const isToday = isSameDay(requestedDate, now);
    const isYesterday = isSameDay(
      requestedDate,
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
    );
    const isPastDate =
      requestedDate <
      new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const allTimes: TTimeSlot[] = [];
    let passedMidnight = false;

    const bookedSlots = new Set<string>();
    events.forEach((event) => {
      if (event.userId === userId) {
        bookedSlots.add(event.startTime);
      }
    });

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];

      if (!passedMidnight && i > 0 && slot === '00:00') {
        passedMidnight = true;
      }

      const [hours, minutes] = slot.split(':').map(Number);
      const slotTimeInMinutes = hours * 60 + minutes;

      let isPast = false;

      if (isToday) {
        isPast = !passedMidnight && slotTimeInMinutes <= currentTimeInMinutes;
      } else if (isPastDate) {
        isPast = true;
      } else if (isYesterday && passedMidnight) {
        isPast = slotTimeInMinutes <= currentTimeInMinutes;
      }

      allTimes.push({
        time: slot,
        isPast,
        isAfterMidnight: passedMidnight,
        isBooked: bookedSlots.has(slot),
      });
    }

    return { AllTimes: allTimes };
  }
  async findOne(id: string): Promise<string[]> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid store ID');
    }

    const store = await this.storeModel.findById(id).exec();
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return generateTimeSlots(store.timeOpen, store.timeClose);
  }

  async update(id: string, updateStoreDto: UpdateStoreDto): Promise<Store> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid store ID');
    }

    const { timeOpen, timeClose } = updateStoreDto;
    if (!timeOpen || !timeClose) {
      throw new NotFoundException('TimeOpen and TimeClose are required');
    }
    const openTime = parseStoreTime(timeOpen);
    const closeTime = parseStoreTime(timeClose);
    validateAndAdjustTimes(openTime, closeTime);

    const updatedStore = await this.storeModel
      .findByIdAndUpdate(
        id,
        {
          timeOpen: openTime,
          timeClose: closeTime,
        },
        { new: true },
      )
      .exec();

    if (!updatedStore) {
      throw new NotFoundException('Store not found');
    }
    return updatedStore;
  }

  async remove(id: string): Promise<Store> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid store ID');
    }

    const deletedStore = await this.storeModel.findByIdAndDelete(id).exec();
    if (!deletedStore) {
      throw new NotFoundException('Store not found');
    }
    return deletedStore;
  }

  async removeAll(): Promise<{ deletedCount: number }> {
    const result = await this.storeModel.deleteMany({}).exec();
    return { deletedCount: result.deletedCount || 0 };
  }
}
