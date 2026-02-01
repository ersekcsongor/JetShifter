import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class AirportsModel extends Document {
  @Prop({ required: true, unique: true })
  iataCode: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  countryCode: string;

  @Prop()
  cityCode?: string;

  @Prop({ required: true })
  timeZone: string;

  // Optional fields - only available for some airports
  @Prop()
  countryName?: string;

  @Prop()
  latitude?: number;

  @Prop()
  longitude?: number;

  // Ryanair-specific fields
  @Prop({ type: [String], default: [] })
  ryanairRoutes: string[];

  @Prop({ default: false })
  isRyanairAirport: boolean;
}

export const AirportsSchema = SchemaFactory.createForClass(AirportsModel);

// Create index for faster lookups
AirportsSchema.index({ iataCode: 1 }, { unique: true });
AirportsSchema.index({ isRyanairAirport: 1 });
