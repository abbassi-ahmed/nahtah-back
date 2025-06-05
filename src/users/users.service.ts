import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { FilterQuery } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(user: User): Promise<User> {
    const createdUser = new this.userModel(user);
    return createdUser.save();
  }

  async findAllPaginated(
    pagination: PaginationDto,
  ): Promise<{ data: User[]; total: number }> {
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
      this.userModel.find().sort(sort).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments().exec(),
    ]);

    return { data, total };
  }
  // Combined find operations
  async findOne(filter: FilterQuery<User>): Promise<User | null> {
    return this.userModel.findOne(filter).exec();
  }

  async findMany(filter: FilterQuery<User>): Promise<User[]> {
    return this.userModel.find(filter).exec();
  }

  async findOneById(id: string): Promise<User | null> {
    return this.findOne({ _id: id });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.findOne({ username });
  }

  async findOneByPhone(phone: string): Promise<User | null> {
    const regex = new RegExp(phone, 'i');
    return this.findOne({ phone: { $regex: regex } });
  }

  // Combined update operations
  async update(
    filter: FilterQuery<User>,
    update: Partial<User>,
  ): Promise<User | null> {
    return this.userModel
      .findOneAndUpdate(filter, update, { new: true })
      .exec();
  }

  async updateById(id: string, update: Partial<User>): Promise<User | null> {
    return this.update({ _id: id }, update);
  }

  async updateResetCode(
    email: string,
    code: string,
    expiration: string,
  ): Promise<User | null> {
    return this.update({ email }, { resetCode: code, expiration });
  }

  async updatePassword(email: string, password: string): Promise<User | null> {
    return this.update({ email }, { password });
  }

  // Delete operation
  async delete(filter: FilterQuery<User>): Promise<User | null> {
    return this.userModel.findOneAndDelete(filter).exec();
  }

  async deleteById(id: string): Promise<User | null> {
    return this.delete({ _id: id });
  }
}
