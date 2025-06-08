import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SavedFlight extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  flightNumber: string;
}

export const SavedFlightSchema = SchemaFactory.createForClass(SavedFlight);
SavedFlightSchema.index({ email: 1, flightNumber: 1 }, { unique: true });