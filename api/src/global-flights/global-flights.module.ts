import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { HttpModule } from '@nestjs/axios';
import {  GlobalFlightsService } from './global-flights.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalFlightsController } from './global-flights.controller';
import { GlobalAirportsService } from '../global-airports/global-airports.service';
@Module({
  imports: [
    SharedModule,
    HttpModule,
  ],
  controllers: [GlobalFlightsController],
  providers: [GlobalFlightsService, GlobalAirportsService],
})
export class GlobalFlightsModule {}