import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Store } from './entities/store.entity';
import { CreateStoreDto, UpdateStoreDto } from './dto/create-store.dto';
import { TTimeSlot } from 'src/types/timeSlot';

@Injectable()
export class StoreService {
  constructor(@InjectModel(Store.name) private storeModel: Model<Store>) {}

  private parseStoreTime(timeString: string): Date {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds, 0);
    return date;
  }

  private validateAndAdjustTimes(openTime: Date, closeTime: Date): void {
    if (closeTime <= openTime) {
      closeTime.setDate(closeTime.getDate() + 1);
    }
  }
  private generateTimeSlots(openTime: string, closeTime: string): string[] {
    const slots: string[] = [];
    let currentTime = new Date(openTime);
    const openTimeFo = new Date(openTime);
    const adjustedCloseTime = new Date(closeTime);
    if (adjustedCloseTime <= openTimeFo) {
      adjustedCloseTime.setDate(adjustedCloseTime.getDate() + 1);
    }

    while (currentTime < adjustedCloseTime) {
      const hours = currentTime.getHours().toString().padStart(2, '0');
      const minutes = currentTime.getMinutes().toString().padStart(2, '0');
      slots.push(`${hours}:${minutes}`);

      currentTime = new Date(currentTime.getTime() + 30 * 60000);
    }

    return slots;
  }

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const { timeOpen, timeClose } = createStoreDto;

    await this.storeModel.deleteMany().exec();
    let openTime: Date;
    let closeTime: Date;

    if (!timeOpen || !timeClose) {
      openTime = this.parseStoreTime('00:00:00');
      closeTime = this.parseStoreTime('23:59:59');
    } else {
      openTime = this.parseStoreTime(timeOpen);
      closeTime = this.parseStoreTime(timeClose);
      this.validateAndAdjustTimes(openTime, closeTime);
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

  async getByDate(date: string): Promise<{ AllTimes: TTimeSlot[] }> {
    const [store] = await this.storeModel.find().limit(1).exec();
    if (!store) return { AllTimes: [] };

    const slots = this.generateTimeSlots(store.timeOpen, store.timeClose);

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

    return this.generateTimeSlots(store.timeOpen, store.timeClose);
  }

  async update(id: string, updateStoreDto: UpdateStoreDto): Promise<Store> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid store ID');
    }

    const { timeOpen, timeClose } = updateStoreDto;
    if (!timeOpen || !timeClose) {
      throw new NotFoundException('TimeOpen and TimeClose are required');
    }
    const openTime = this.parseStoreTime(timeOpen);
    const closeTime = this.parseStoreTime(timeClose);
    this.validateAndAdjustTimes(openTime, closeTime);

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
