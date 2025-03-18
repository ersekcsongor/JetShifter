import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { AirportsService } from './airports.service';
import { AirportsController } from './airports.controller';
@Module({
  imports: [
    SharedModule
  ],
  controllers: [AirportsController],
  providers: [AirportsService],
})
export class AirportsModule {}