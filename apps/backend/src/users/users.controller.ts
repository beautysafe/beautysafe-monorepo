import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiPayloadTooLargeResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { memoryStorage } from 'multer';
import { UpdateMeDto } from './dto/update-me.dto';
import { MAX_IMAGE_SIZE } from '../storage/file-validation';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // GET /users/me
  @Get('me')
  getMe(@Req() req: any) {
    return this.usersService.getMe(req.user.userId);
  }

  // PATCH /users/me
  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(req.user.userId, dto);
  }

  // DELETE /users/me
  @Delete('me')
  deleteMe(@Req() req: any) {
    return this.usersService.deleteMe(req.user.userId);
  }

  // GET /users/me/favorites
  @Get('me/favorites')
  listFavorites(@Req() req: any) {
    return this.usersService.listFavorites(req.user.userId);
  }

  // POST /users/me/favorites/:productUid
  @Post('me/favorites/:productUid')
  addFavorite(@Req() req: any, @Param('productUid') productUid: string) {
    return this.usersService.addFavorite(req.user.userId, Number(productUid));
  }

  // DELETE /users/me/favorites/:productUid
  @Delete('me/favorites/:productUid')
  removeFavorite(@Req() req: any, @Param('productUid') productUid: string) {
    return this.usersService.removeFavorite(
      req.user.userId,
      Number(productUid),
    );
  }
  @Post('me/avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Updated current-user response' })
  @ApiBadRequestResponse({
    description: 'Missing, empty, invalid, or unsupported image',
  })
  @ApiPayloadTooLargeResponse({ description: 'Image exceeds 10 MB' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_SIZE },
    }),
  )
  async uploadAvatar(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateAvatar(req.user.userId, file);
  }
}
