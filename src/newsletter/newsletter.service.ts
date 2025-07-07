import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Newsletter } from './entities/newsletter.entity';
import { Model } from 'mongoose';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { findAllPaginated } from 'src/utils/generic/pagination';
import { CreateNewsletterDto } from './dto/createNewsLetter';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(Newsletter.name)
    private readonly newsletterModel: Model<Newsletter>,
  ) {}

  async create(createNewsletterDto: CreateNewsletterDto) {
    const createdNewsletter = new this.newsletterModel(createNewsletterDto);
    return await createdNewsletter.save();
  }

  async findAll() {
    return this.newsletterModel.find().exec();
  }

  async findAllPaginatedNews(pagination: PaginationDto) {
    return findAllPaginated(this.newsletterModel, pagination);
  }

  async findOne(id: string) {
    return await this.newsletterModel.findById(id).exec();
  }
  async getByUserId(userId: string) {
    return await this.newsletterModel.find({ admin: userId }).exec();
  }

  async update(id: string, updateNewsletterDto: CreateNewsletterDto) {
    const updatedNewsletter = await this.newsletterModel
      .findByIdAndUpdate(id, updateNewsletterDto, {
        new: true,
      })
      .exec();

    if (!updatedNewsletter) {
      throw new Error('Newsletter not found');
    }
    return updatedNewsletter;
  }
  async remove(id: string) {
    const deletedNewsletter = await this.newsletterModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedNewsletter) {
      throw new Error('Newsletter not found');
    }
    return deletedNewsletter;
  }

  async removeAll(): Promise<any> {
    return await this.newsletterModel.deleteMany({}).exec();
  }
}
