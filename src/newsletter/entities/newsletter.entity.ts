// src/newsletter/schemas/newsletter.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Admin } from 'src/admins/entities/admin.entity';

@Schema({ timestamps: true })
export class Newsletter extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  text: string;

  @Prop({ type: Types.ObjectId, ref: 'Admin', required: true })
  admin: Admin;
}

export const NewsletterSchema = SchemaFactory.createForClass(Newsletter);
