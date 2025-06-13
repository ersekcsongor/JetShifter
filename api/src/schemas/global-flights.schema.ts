import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class GlobalFlightDataModel extends Document {
  
  @Prop({ required: true })
  flightNumber: string;

  @Prop({ required: true })
  origin: string;

  @Prop({ required: true })
  destination: string;

  @Prop({ type: [String], required: true })
  time: string[];

  @Prop({ required: true })
  duration: string;

}

export const GlobalFlightsSchema = SchemaFactory.createForClass(GlobalFlightDataModel);