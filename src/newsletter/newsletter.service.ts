import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Newsletter } from './entities/newsletter.entity';
import { Model } from 'mongoose';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(Newsletter.name)
    private readonly newsletterModel: Model<Newsletter>,
  ) {}
  async create(createNewsletterDto: Newsletter) {
    const createdNewsletter = new this.newsletterModel(createNewsletterDto);
    return await createdNewsletter.save();
  }

  async findAll() {
    return this.newsletterModel.find().exec();
  }

  async findOne(id: number) {
    return await this.newsletterModel.findById(id).exec();
  }
  async getByUserId(userId: string) {
    return await this.newsletterModel.find({ admin: userId }).exec();
  }

  async update(id: number, updateNewsletterDto: Newsletter) {
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
  async remove(id: number) {
    const deletedNewsletter = await this.newsletterModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedNewsletter) {
      throw new Error('Newsletter not found');
    }
    return deletedNewsletter;
  }
}
