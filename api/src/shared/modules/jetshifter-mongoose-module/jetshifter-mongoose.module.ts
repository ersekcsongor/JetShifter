import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'src/shared/config/config';
import { AirportsModel , AirportsSchema } from 'src/schemas/airports.schema';
import { FlightDataModel, FlightSchema, } from 'src/schemas/flights.schema';
import { UserModel, UserSchema } from 'src/schemas/user.schema';
@Module({
  imports: [
    MongooseModule.forRoot(config.get('db.url')),
    MongooseModule.forFeature([{ name: AirportsModel.name, schema: AirportsSchema, collection: 'Airports' }]),
    MongooseModule.forFeature([{ name: FlightDataModel.name, schema: FlightSchema, collection: 'Flights' }]),    
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema, collection: 'User' }]),

  ],
  exports: [
    MongooseModule.forRoot(config.get('db.url')),
    MongooseModule.forFeature([{ name: AirportsModel.name, schema: AirportsSchema, collection: 'Airports' }]),
    MongooseModule.forFeature([{ name: FlightDataModel.name, schema: FlightSchema, collection: 'Flights' }]),
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema, collection: 'User' }]),

  ]   
})
export class JetshifterMongooseModule {}
