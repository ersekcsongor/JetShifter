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
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UserMapper } from './users.mapper';
import { UserProfileDto } from './dto/output/user-profile.dto';
import * as multer from 'multer';
import { Response, Request } from 'express';
import { existsSync } from 'fs';
import { ChangePasswordDto } from './dto/input/change-password.dto';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { UserModel } from '../schemas/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

// Define UPLOAD_DIR at top level
const UPLOAD_DIR = join(__dirname, '../../uploads');

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
  @UseInterceptors(
    FileInterceptor('profile', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname);
          const name = `profile-${Date.now()}${ext}`;
          cb(null, name);
        },
      }),
    }),
  )
  async uploadProfile(
    @UploadedFile() file: multer.File,
    @CurrentUser() user: UserModel,
    @Req() req: Request,
  ): Promise<{ profileImageUrl: string }> {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    // Use consistent base URL construction
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/users/profile/${file.filename}`;
    const saveUrl = `/users/profile/${file.filename}`;
    user.profileImage = saveUrl;
    await user.save();

    return { profileImageUrl: saveUrl };
  }

  @Get('profile/:filename')
  async serveProfileImage(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const fullPath = join(UPLOAD_DIR, filename);
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }

    // Set proper cache headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    return res.sendFile(fullPath);
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
}