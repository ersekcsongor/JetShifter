import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { UsersModule } from './users/users.module';

const YAML_CONFIG_FILENAME = '.env.yml';

// Load the YAML config file
const yamlConfig = yaml.parse(fs.readFileSync(YAML_CONFIG_FILENAME, 'utf8'));

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => yamlConfig], // Load YAML config as an object
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'), // Read MONGO_URI from .env.yml
      }),
      inject: [ConfigService],
    }),
    UsersModule,    
  ],
})
export class AppModule {}
