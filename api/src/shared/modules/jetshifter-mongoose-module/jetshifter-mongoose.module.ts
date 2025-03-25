import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CountryModel, CountrySchema } from 'src/schemas/country.schema';
import { config } from 'src/shared/config/config';
import { AirportsModel , AirportsSchema } from 'src/schemas/airports.schema';
import { FlightDataModel, FlightSchema, } from 'src/schemas/flights.schema';
@Module({
  imports: [
    MongooseModule.forRoot(config.get('db.url')),
    MongooseModule.forFeature([{ name: CountryModel.name, schema: CountrySchema, collection: 'Country' }]),
    MongooseModule.forFeature([{ name: AirportsModel.name, schema: AirportsSchema, collection: 'Airports' }]),
    MongooseModule.forFeature([{ name: FlightDataModel.name, schema: FlightSchema, collection: 'Flights' }]),
  ],
  exports: [
    MongooseModule.forRoot(config.get('db.url')),
    MongooseModule.forFeature([{ name: CountryModel.name, schema: CountrySchema, collection: 'Country' }]),
    MongooseModule.forFeature([{ name: AirportsModel.name, schema: AirportsSchema, collection: 'Airports' }]),
    MongooseModule.forFeature([{ name: FlightDataModel.name, schema: FlightSchema, collection: 'Flights' }]),
  ]   
})
export class JetshifterMongooseModule {}
