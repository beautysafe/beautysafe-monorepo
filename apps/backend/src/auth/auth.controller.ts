import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  AuthTokenResponseDto,
  LoginResponseDto,
  LogoutResponseDto,
} from './dto/auth-token-response.dto';

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

    return this.usersService.create(
      body.email,
      body.password,
      role,
    ) as Promise<unknown>;
  }
  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Authenticate and create a one-year rotating refresh session',
  })
  @ApiCreatedResponse({ type: LoginResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid email or password format' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.authService.login(user);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate a refresh token and issue a new access token',
    description:
      'The supplied refresh token is revoked atomically. Reusing it returns 401.',
  })
  @ApiOkResponse({ type: AuthTokenResponseDto })
  @ApiBadRequestResponse({ description: 'refreshToken is required' })
  @ApiUnauthorizedResponse({
    description: 'Invalid, expired, revoked, or reused refresh token',
  })
  refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body.refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke one refresh session',
    description:
      'Idempotent. Unknown, expired, or already revoked tokens also return success.',
  })
  @ApiOkResponse({ type: LogoutResponseDto })
  @ApiBadRequestResponse({ description: 'refreshToken is required' })
  logout(@Body() body: RefreshTokenDto) {
    return this.authService.logout(body.refreshToken);
  }
}
