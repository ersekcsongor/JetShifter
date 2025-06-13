import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { HttpModule } from '@nestjs/axios';
import {  GlobalFlightsService } from './global-flights.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedFlight, SavedFlightSchema } from 'src/schemas/saved-flight.schema';
import { GlobalFlightsController } from './global-flights.controller';
import { GlobalAirportsService } from 'src/global-airports/global-airports.service';
@Module({
  imports: [
    SharedModule,
    HttpModule,
  ],
  controllers: [GlobalFlightsController],
  providers: [GlobalFlightsService, GlobalAirportsService],
})
export class GlobalFlightsModule {}