import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { AirportsService } from './airports.service';
import { AirportsController } from './airports.controller';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    SharedModule,HttpModule
  ],
  controllers: [AirportsController],
  providers: [AirportsService],
})
export class AirportsModule {}