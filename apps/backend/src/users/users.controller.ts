import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
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
}
