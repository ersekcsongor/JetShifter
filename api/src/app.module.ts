import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { UsersModule } from './users/users.module';
import { SharedModule } from './shared/shared.module';
import { AirportsModule } from './airports/airports.module';
import { FlightsModule } from './flights/flights.module';
import { AuthModule } from './auth/auth.module';
import { GlobalAirportsModule } from './global-airports/global-airports.module';
import { GlobalFlightsModule } from './global-flights/global-flights.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TransatlanticFlightsModule } from './transatlantic-flights/transatlantic-flights.module';
const YAML_CONFIG_FILENAME = '.env.yml';

// Make yamlConfig optional - only load if file exists
let yamlConfig = {};
if (fs.existsSync(YAML_CONFIG_FILENAME)) {
  yamlConfig = yaml.parse(fs.readFileSync(YAML_CONFIG_FILENAME, 'utf8'));
}

@Module({
  imports: [
    SharedModule,AirportsModule,FlightsModule,AuthModule,UsersModule,GlobalAirportsModule,GlobalFlightsModule, ChatModule, NotificationsModule, TransatlanticFlightsModule,
  ]

})
export class AppModule {}
