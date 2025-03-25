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

  @Prop({ type: Object, required: true }) // Store the raw API response
  flights: Record<string, any>;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const FlightSchema = SchemaFactory.createForClass(FlightDataModel);