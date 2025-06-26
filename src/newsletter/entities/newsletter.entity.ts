import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Newsletter extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  text: string;
}

export const NewsletterSchema = SchemaFactory.createForClass(Newsletter);
