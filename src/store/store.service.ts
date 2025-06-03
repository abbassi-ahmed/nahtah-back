import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Store } from './entities/store.entity';
import { CreateStoreDto, UpdateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoreService {
  constructor(@InjectModel(Store.name) private storeModel: Model<Store>) {}

  private parseStoreTime(timeString: string): Date {
    return new Date(`1970-01-01T${timeString}:00Z`);
  }

  private validateAndAdjustTimes(
    openTime: Date,
    closeTime: Date,
  ): { openTime: Date; closeTime: Date } {
    if (closeTime <= openTime) {
      closeTime.setUTCDate(closeTime.getUTCDate() + 1);
    }
    return { openTime, closeTime };
  }

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const { timeOpen, timeClose, userId } = createStoreDto;

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
      userId: new Types.ObjectId(userId),
    };

    try {
      const createdStore = new this.storeModel(storeData);
      return await createdStore.save();
    } catch (error) {
      throw new Error(`Failed to create store: ${error.message}`);
    }
  }

  async findAll(): Promise<Store[]> {
    return this.storeModel.find().exec();
  }

  async findOne(id: string): Promise<Store> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid store ID');
    }

    const store = await this.storeModel.findById(id).exec();
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    return store;
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
          ...(updateStoreDto.userId && {
            userId: new Types.ObjectId(updateStoreDto.userId),
          }),
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
