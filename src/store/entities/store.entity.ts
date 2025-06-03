import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Store extends Document {
  @Prop({ type: String, required: true })
  timeOpen: string;

  @Prop({ type: String, required: true })
  timeClose: string;
}

export const StoreSchema = SchemaFactory.createForClass(Store);
