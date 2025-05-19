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
}

export const UserSchema = SchemaFactory.createForClass(UserModel);