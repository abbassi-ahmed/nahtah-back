import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { FilterQuery } from 'mongoose';
import { Admin } from './entities/admin.entity';
import { findAllPaginated } from 'src/utils/generic/pagination';

@Injectable()
export class AdminsService {
  constructor(@InjectModel(Admin.name) private adminModel: Model<Admin>) {}

  async create(Admin: Admin): Promise<Admin> {
    const createdUser = new this.adminModel(Admin);
    return createdUser.save();
  }

  // Combined find operations
  async findOne(filter: FilterQuery<Admin>): Promise<Admin | null> {
    return this.adminModel.findOne(filter).exec();
  }

  async findMany(filter: FilterQuery<Admin>): Promise<Admin[]> {
    return this.adminModel.find(filter).exec();
  }

  async findAllPaginatedAdmins(pagination: PaginationDto) {
    return findAllPaginated(this.adminModel, pagination);
  }
  async findOneById(id: string): Promise<Admin | null> {
    return this.findOne({ _id: id });
  }

  async findOneByEmail(email: string): Promise<Admin | null> {
    return this.findOne({ email });
  }

  async findOneByUsername(username: string): Promise<Admin | null> {
    return this.findOne({ username });
  }

  async findOneByPhone(phone: string): Promise<Admin | null> {
    const regex = new RegExp(phone, 'i');
    return this.findOne({ phone: { $regex: regex } });
  }

  // Combined update operations
  async update(
    filter: FilterQuery<Admin>,
    update: Partial<Admin>,
  ): Promise<Admin | null> {
    return this.adminModel
      .findOneAndUpdate(filter, update, { new: true })
      .exec();
  }

  async updateById(id: string, update: Partial<Admin>): Promise<Admin | null> {
    return this.update({ _id: id }, update);
  }

  async updateResetCode(
    email: string,
    code: string,
    expiration: string,
  ): Promise<Admin | null> {
    return this.update({ email }, { resetCode: code, expiration });
  }

  async updatePassword(email: string, password: string): Promise<Admin | null> {
    return this.update({ email }, { password });
  }

  // Delete operation
  async delete(filter: FilterQuery<Admin>): Promise<Admin | null> {
    return this.adminModel.findOneAndDelete(filter).exec();
  }

  async deleteById(id: string): Promise<Admin | null> {
    return this.delete({ _id: id });
  }
}
