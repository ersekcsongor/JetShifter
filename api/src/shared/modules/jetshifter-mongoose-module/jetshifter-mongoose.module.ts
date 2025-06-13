import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'src/shared/config/config';
import { AirportsModel , AirportsSchema } from 'src/schemas/airports.schema';
import { FlightDataModel, FlightSchema, } from 'src/schemas/flights.schema';
import { UserModel, UserSchema } from 'src/schemas/user.schema';
import { GlobalAirportsModel, GlobalAirportsSchema } from 'src/schemas/global-airports.schema';
import { SavedFlightSchema,SavedFlight } from 'src/schemas/saved-flight.schema';
import { GlobalFlightsSchema, GlobalFlightDataModel } from 'src/schemas/global-flights.schema';
@Module({
  imports: [
    MongooseModule.forRoot(config.get('db.url')),
    MongooseModule.forFeature([{ name: AirportsModel.name, schema: AirportsSchema, collection: 'Airports' }]),
    MongooseModule.forFeature([{ name: FlightDataModel.name, schema: FlightSchema, collection: 'Flights' }]),    
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema, collection: 'User' }]),
    MongooseModule.forFeature([{ name: GlobalAirportsModel.name, schema: GlobalAirportsSchema, collection: 'GlobalAirports' }]),
    MongooseModule.forFeature([{ name: SavedFlight.name, schema: SavedFlightSchema, collection: 'SavedFlights' }]),
    MongooseModule.forFeature([{ name: GlobalFlightDataModel.name, schema: GlobalFlightsSchema, collection: 'GlobalFlights' }]),
  ],
  exports: [
    MongooseModule.forRoot(config.get('db.url')),
    MongooseModule.forFeature([{ name: AirportsModel.name, schema: AirportsSchema, collection: 'Airports' }]),
    MongooseModule.forFeature([{ name: FlightDataModel.name, schema: FlightSchema, collection: 'Flights' }]),
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema, collection: 'User' }]),
    MongooseModule.forFeature([{ name: GlobalAirportsModel.name, schema: GlobalAirportsSchema, collection: 'GlobalAirports' }]),
    MongooseModule.forFeature([{ name: SavedFlight.name, schema: SavedFlightSchema, collection: 'SavedFlights' }]),
    MongooseModule.forFeature([{ name: GlobalFlightDataModel.name, schema: GlobalFlightsSchema, collection: 'GlobalFlights' }]),
  ]   
})
export class JetshifterMongooseModule {}
