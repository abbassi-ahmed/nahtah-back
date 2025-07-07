import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../entities/user.entity';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { FilterQuery } from 'mongoose';
import { findAllPaginated } from 'src/utils/generic/pagination';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/createUser.dto';
@Injectable()
export class AdminsService {
  constructor(@InjectModel(User.name) private adminModel: Model<User>) {}

  private withNotArchived(filter: FilterQuery<User> = {}): FilterQuery<User> {
    return { ...filter, archived: false, position: 'admin' };
  }

  async create(user: CreateUserDto): Promise<User> {
    const createdUser = new this.adminModel(user);
    return createdUser.save();
  }

  async findAllPaginatedUsers(pagination: PaginationDto) {
    const filter = this.withNotArchived();
    return findAllPaginated(this.adminModel, pagination, undefined, filter);
  }
  async findOne(filter: FilterQuery<User>): Promise<User | null> {
    return this.adminModel.findOne(this.withNotArchived(filter)).exec();
  }

  async findMany(filter: FilterQuery<User>): Promise<User[]> {
    return this.adminModel.find(this.withNotArchived(filter)).exec();
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

  async update(
    filter: FilterQuery<User>,
    update: Partial<User>,
  ): Promise<User | null> {
    return this.adminModel
      .findOneAndUpdate(this.withNotArchived(filter), update, { new: true })
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

  async delete(filter: FilterQuery<User>): Promise<User | null> {
    return this.adminModel
      .findOneAndDelete(this.withNotArchived(filter))
      .exec();
  }

  async archiveUser(
    id: string,
    password: string,
    reason?: string,
  ): Promise<User | null> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new BadRequestException('Password is incorrect');
    }

    return this.updateById(id, {
      archived: true,
      reason,
    });
  }
  async deleteById(id: string): Promise<User | null> {
    return this.delete({ _id: id });
  }
}
