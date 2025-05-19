import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { config } from '../shared/config/config';
import { SharedModule } from 'src/shared/shared.module';
@Module({
  imports: [
    SharedModule,
    JwtModule.register({
      secret: config.get('jwt_secret'),
      global: true,
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}