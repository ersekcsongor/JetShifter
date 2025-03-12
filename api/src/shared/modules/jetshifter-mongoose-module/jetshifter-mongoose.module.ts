import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CountryModel, CountrySchema } from 'src/schemas/country.schema';
import { config } from 'src/shared/config/config';

@Module({
  imports: [
    MongooseModule.forRoot(config.get('db.url')),
    MongooseModule.forFeature([{ name: CountryModel.name, schema: CountrySchema, collection: 'Country' }]),
  ],
  exports: [
    MongooseModule.forRoot(config.get('db.url')),
    MongooseModule.forFeature([{ name: CountryModel.name, schema: CountrySchema, collection: 'Country' }]),
  ],
})
export class JetshifterMongooseModule {}
