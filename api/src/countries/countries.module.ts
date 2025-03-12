import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';
import { CountryModel } from '../schemas/country.schema';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    SharedModule
  ],
  controllers: [CountriesController],
  providers: [CountriesService],
})
export class CountriesModule {}