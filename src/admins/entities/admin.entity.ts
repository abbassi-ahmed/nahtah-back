import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Admin extends Document {
  @Prop({ type: Number })
  order: number;

  @Prop({ type: String, required: true })
  username: string;

  @Prop({ type: String, default: 'admin@example.com', unique: true })
  email: string;

  @Prop({ type: String, default: '' })
  phone: string;

  @Prop({
    type: String,
    default:
      'https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-Vector-PNG-File.png',
  })
  image: string;

  @Prop({ type: String, default: 'Admin' })
  position: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String })
  resetCode: string;

  @Prop({ type: String })
  expiration: string;

  @Prop({ type: Boolean, default: true })
  isSupper: boolean;

  @Prop({ type: String, default: 'Admin' })
  type: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
