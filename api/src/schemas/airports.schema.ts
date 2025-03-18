import { Prop ,Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema()
export class AirportsModel extends Document {
  @Prop({ required: true })
  iataCode: string;

  @Prop({ required: true })
  name: string;
  
  @Prop({ required: true })
  countryCode: string;

  @Prop({ required: true })
  cityCode: string;

  @Prop({required: true})
  timeZone: string;

  @Prop({required: true})
  latitude: number;

  @Prop({required: true})
  longitude: number;

  @Prop({ type: [String], default: [] }) // Add the routes field
  routes: string[];
}

export const AirportsSchema = SchemaFactory.createForClass(AirportsModel);