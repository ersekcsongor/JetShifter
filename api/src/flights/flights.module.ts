import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { HttpModule } from '@nestjs/axios';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { AirportsService } from 'src/airports/airports.service';
@Module({
  imports: [
    SharedModule,HttpModule
  ],
  controllers: [FlightsController],
  providers: [FlightsService,AirportsService],
})
export class FlightsModule {}