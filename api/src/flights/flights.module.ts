import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { HttpModule } from '@nestjs/axios';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { AirportsService } from '../airports/airports.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedFlightSchema } from '../schemas/saved-flight.schema';
@Module({
  imports: [
    SharedModule,
    HttpModule,
    MongooseModule.forFeature([
      { name: 'SavedFlight', schema: SavedFlightSchema },
    ]),
  ],
  controllers: [FlightsController],
  providers: [FlightsService, AirportsService],
})
export class FlightsModule {}