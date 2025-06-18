import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  start: string;

  @Prop({ type: String, required: true })
  end: string;

  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  barberImg: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  client: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['ACCEPTED', 'DECLINED', 'PENDING'],
    default: 'PENDING',
  })
  status: 'ACCEPTED' | 'DECLINED' | 'PENDING';

  @Prop({ type: String })
  reason: string;

  @Prop({ type: Number, default: undefined })
  rate?: number;

  @Prop({ type: String, default: undefined })
  feedback?: string;

  @Prop({ type: String, default: 'Event' })
  type: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
