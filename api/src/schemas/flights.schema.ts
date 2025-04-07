import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class FlightDataModel extends Document {
  @Prop({ required: true })
  origin: string;

  @Prop({ required: true })
  destination: string;

  @Prop({ required: true })
  date: string;

  @Prop({ type: [{
    origin: String,
    destination: String,
    flightNumber: String,
    time: [String],
    timeUTC: [String],
    duration: String
  }], required: true })
  flights: Array<Record<string, any>>;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const FlightSchema = SchemaFactory.createForClass(FlightDataModel);