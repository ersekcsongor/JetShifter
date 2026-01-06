import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SavedFlight extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  flightNumber: string;

  // Track whether this is a Ryanair or custom flight
  @Prop({ default: 'ryanair' })
  source?: string;

  // Store full flight details for flights not in FlightData collection
  @Prop({ type: Object })
  flightData?: {
    origin?: string;
    destination?: string;
    departureTime?: string;
    arrivalTime?: string;
    duration?: string;
    aircraft?: string;
    [key: string]: any;
  };
}

export const SavedFlightSchema = SchemaFactory.createForClass(SavedFlight);
SavedFlightSchema.index({ email: 1, flightNumber: 1 }, { unique: true });