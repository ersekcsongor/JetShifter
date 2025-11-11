import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from '../../config/config';
import { AirportsModel, AirportsSchema } from '../../../schemas/airports.schema';
import { FlightDataModel, FlightSchema } from '../../../schemas/flights.schema';
import { UserModel, UserSchema } from '../../../schemas/user.schema';
import { GlobalAirportsModel, GlobalAirportsSchema } from '../../../schemas/global-airports.schema';
import { SavedFlight, SavedFlightSchema } from '../../../schemas/saved-flight.schema';
import { GlobalFlightDataModel, GlobalFlightsSchema } from '../../../schemas/global-flights.schema';
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
