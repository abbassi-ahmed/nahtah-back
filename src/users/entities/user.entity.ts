import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PositionEnum } from 'src/types/positionEnum';

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

  @Prop({ default: 'user', enum: PositionEnum })
  position: PositionEnum;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 0 })
  points: number;

  @Prop()
  resetCode: string;

  @Prop()
  expiration: string;

  @Prop({ default: false })
  banned: boolean;

  @Prop({ default: false })
  archived: boolean;

  @Prop({ nullable: true })
  reason: string;

  @Prop()
  pushToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
