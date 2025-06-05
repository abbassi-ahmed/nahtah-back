// src/off-days/schemas/off-days.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class OffDays extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  date: string;
}

export const OffDaysSchema = SchemaFactory.createForClass(OffDays);
