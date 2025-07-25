import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { User } from 'src/users/entities/user.entity';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  text: string;

  @Prop({ type: String })
  redirection: string;

  @Prop({ type: String, required: true })
  time: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  client: Types.ObjectId | User;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'User' }], default: [] })
  viewedBy: Types.ObjectId[];
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
