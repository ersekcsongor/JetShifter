// users.controller.ts
import {
  Controller,
  Get,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Param,
  Res,
  Req,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { UserMapper } from './users.mapper';
import { UserProfileDto } from './dto/output/user-profile.dto';
import * as multer from 'multer';
import { Request } from 'express';
import { ChangePasswordDto } from './dto/input/change-password.dto';
import { UpdateSleepTimesDto } from './dto/input/update-sleep-times.dto';
import { UpdatePreferencesDto } from './dto/input/update-preferences.dto';
import { UpdateChronotypeDto } from './dto/input/update-chronotype.dto';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { UserModel } from '../schemas/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as admin from 'firebase-admin';

@Controller('users')
export class UsersController {
  constructor(private readonly usersMapper: UserMapper, private readonly usersService: UsersService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  async getMe(@CurrentUser() user: UserModel): Promise<UserProfileDto> {
    return this.usersMapper.toUserProfileDto(user);
  }

  @UseGuards(JwtGuard)
  @Patch('upload-profile')
  @UseInterceptors(FileInterceptor('profile'))
  async uploadProfile(
    @UploadedFile() file: multer.File,
    @CurrentUser() user: UserModel,
  ): Promise<{ profileImageUrl: string }> {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      // Get Firebase Storage bucket
      const bucket = admin.storage().bucket();

      // Generate unique filename
      const ext = extname(file.originalname);
      const filename = `profile-pictures/${user.id}-${Date.now()}${ext}`;

      // Create file reference in Firebase Storage
      const fileUpload = bucket.file(filename);

      // Upload file buffer to Firebase
      await fileUpload.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            userId: user.id,
            originalName: file.originalname,
          },
        },
      });

      // Make the file publicly accessible
      await fileUpload.makePublic();

      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

      // Delete old profile picture from Firebase if exists
      if (user.profileImage && user.profileImage.includes('storage.googleapis.com')) {
        try {
          const oldFilename = user.profileImage.split('/').slice(-2).join('/');
          await bucket.file(oldFilename).delete();
        } catch (error) {
          console.log('Old profile image not found or already deleted');
        }
      }

      // Update user profile image URL
      user.profileImage = publicUrl;
      await user.save();

      return { profileImageUrl: publicUrl };
    } catch (error) {
      console.error('Firebase upload error:', error);
      throw new HttpException(
        'Failed to upload profile image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtGuard)
  @Patch('change-password')
  async changePassword(
    @CurrentUser() user: UserModel,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(
      user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword
    );
    return { message: 'Password updated successfully' };
  }

  @UseGuards(JwtGuard)
  @Patch('update-sleep-times')
  async updateSleepTimes(
    @CurrentUser() user: UserModel,
    @Body() updateSleepTimesDto: UpdateSleepTimesDto,
  ) {
    user.bedtime = updateSleepTimesDto.bedtime;
    user.wakeupTime = updateSleepTimesDto.wakeupTime;
    await user.save();
    return {
      message: 'Sleep times updated successfully',
      bedtime: user.bedtime,
      wakeupTime: user.wakeupTime
    };
  }

  @UseGuards(JwtGuard)
  @Patch('update-preferences')
  async updatePreferences(
    @CurrentUser() user: UserModel,
    @Body() updatePreferencesDto: UpdatePreferencesDto,
  ) {
    user.useMelatonin = updatePreferencesDto.useMelatonin;
    user.useCoffee = updatePreferencesDto.useCoffee;
    await user.save();
    return {
      message: 'Preferences updated successfully',
      useMelatonin: user.useMelatonin,
      useCoffee: user.useCoffee
    };
  }

  @UseGuards(JwtGuard)
  @Patch('update-chronotype')
  async updateChronotype(
    @CurrentUser() user: UserModel,
    @Body() updateChronotypeDto: UpdateChronotypeDto,
  ) {
    user.chronotype = updateChronotypeDto.chronotype;
    await user.save();
    return {
      message: 'Chronotype updated successfully',
      chronotype: user.chronotype
    };
  }

  @UseGuards(JwtGuard)
  @Patch('register-push-token')
  async registerPushToken(
    @CurrentUser() user: UserModel,
    @Body() body: { pushToken: string },
  ) {
    user.expoPushToken = body.pushToken;
    await user.save();
    return {
      message: 'Push token registered successfully',
      token: user.expoPushToken
    };
  }
}