import { Module } from '@nestjs/common';
import { GlobalAirportsService } from './global-airports.service';
import { GlobalAirportsController } from './global-airports.controller';
import { SharedModule } from 'src/shared/shared.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    SharedModule,HttpModule
  ],
  controllers: [GlobalAirportsController],
  providers: [GlobalAirportsService],
})
export class GlobalAirportsModule {}