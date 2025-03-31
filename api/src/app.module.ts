import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { UsersModule } from './users/users.module';
import { SharedModule } from './shared/shared.module';
import { AirportsModule } from './airports/airports.module';
import { FlightsModule } from './flights/flights.module';

const YAML_CONFIG_FILENAME = '.env.yml';

// Load the YAML config file
const yamlConfig = yaml.parse(fs.readFileSync(YAML_CONFIG_FILENAME, 'utf8'));

@Module({
  imports: [
    SharedModule,AirportsModule,FlightsModule,
  ]

})
export class AppModule {}
