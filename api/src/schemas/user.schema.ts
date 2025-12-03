// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class UserModel extends Document{
  
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  hashedPassword: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: '' })
  profileImage?: string;

  @Prop({ default: '22:00' })
  bedtime?: string;

  @Prop({ default: '06:00' })
  wakeupTime?: string;

  @Prop({ default: false })
  useMelatonin?: boolean;

  @Prop({ default: false })
  useCoffee?: boolean;

  @Prop({ default: 'intermediate', enum: ['morning', 'evening', 'intermediate'] })
  chronotype?: string;

  @Prop({ default: '' })
  expoPushToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);