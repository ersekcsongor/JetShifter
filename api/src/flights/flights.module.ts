import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { HttpModule } from '@nestjs/axios';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { AirportsService } from 'src/airports/airports.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedFlight, SavedFlightSchema } from 'src/schemas/saved-flight.schema';
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