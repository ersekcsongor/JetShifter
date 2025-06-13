import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class GlobalAirportsModel extends Document {
    @Prop({ required: true })
    iataCode: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    countryCode: string;

    @Prop({ required: true })
    cityCode: string;

    @Prop({ required: true })
    timeZone: string;

    @Prop({ required: true })
    countryName: string;
}

export const GlobalAirportsSchema = SchemaFactory.createForClass(GlobalAirportsModel);