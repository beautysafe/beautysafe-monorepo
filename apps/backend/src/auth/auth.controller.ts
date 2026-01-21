import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}
  @Public()
  @Post('register')
  async register(@Body() body: RegisterDto) {
    const existing = await this.usersService.findByEmail(body.email);
    if (existing) throw new UnauthorizedException('User already exists');

    let role: UserRole = UserRole.CLIENT;
    if (body.role === UserRole.ADMIN) role = UserRole.ADMIN;

    return this.usersService.create(body.email, body.password, role);
  }
  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.authService.login(user);
  }
}
