import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateMeDto } from './dto/update-me.dto';

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
    return this.usersService.removeFavorite(req.user.userId, Number(productUid));
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');

    // public URL (served by Nest static, see step 3)
    const url = `${process.env.PUBLIC_BASE_URL || ''}/uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar(req.user.userId, url, file.filename);
  }
}
