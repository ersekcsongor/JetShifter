import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransatlanticFlightsController } from './transatlantic-flights.controller';
import { TransatlanticFlightsRealtimeService } from './transatlantic-flights-realtime.service';
import {
  GlobalFlightDataModel,
  GlobalFlightsSchema,
} from '../schemas/global-flights.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GlobalFlightDataModel.name, schema: GlobalFlightsSchema },
    ]),
  ],
  controllers: [TransatlanticFlightsController],
  providers: [TransatlanticFlightsRealtimeService],
  exports: [TransatlanticFlightsRealtimeService],
})
export class TransatlanticFlightsModule {}
