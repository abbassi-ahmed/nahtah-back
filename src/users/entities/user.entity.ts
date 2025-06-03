import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ default: 'User@example.com', unique: true })
  email: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({
    default:
      'https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-Vector-PNG-File.png',
  })
  image: string;

  @Prop({ default: 'User' })
  position: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  resetCode: string;

  @Prop()
  expiration: string;

  @Prop()
  points: number;

  @Prop({ default: false })
  banned: boolean;

  @Prop()
  pushToken: string;

  @Prop({ default: 'User' })
  type: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
