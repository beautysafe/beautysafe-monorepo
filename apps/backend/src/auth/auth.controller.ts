import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
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
import { PasswordResetService } from './password-reset.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  ForgotPasswordResponseDto,
  ResetPasswordResponseDto,
  VerifyResetCodeResponseDto,
} from './dto/password-reset-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private passwordResetService: PasswordResetService,
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

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request a password-reset verification code',
    description:
      'Always returns the same response to prevent account enumeration. Codes expire after 10 minutes; resend requests have a 60-second cooldown. Limits are five requests per email and twenty requests per IP per hour.',
  })
  @ApiOkResponse({ type: ForgotPasswordResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid email format' })
  forgotPassword(@Body() body: ForgotPasswordDto, @Req() request: Request) {
    return this.passwordResetService.requestReset(body.email, this.ip(request));
  }

  @Public()
  @Post('verify-reset-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify a six-digit password-reset code',
    description:
      'A successful verification consumes the code and returns a single-use reset token valid for 10 minutes. A maximum of five attempts is allowed.',
  })
  @ApiOkResponse({ type: VerifyResetCodeResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid email or code format' })
  @ApiUnauthorizedResponse({
    description: 'Invalid, expired, consumed, or attempt-limited code',
  })
  verifyResetCode(@Body() body: VerifyResetCodeDto) {
    return this.passwordResetService.verifyCode(body.email, body.code);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consume a reset token and replace the password',
    description:
      'Atomically consumes the reset token, revokes all refresh sessions and outstanding reset requests, and invalidates previously issued access tokens.',
  })
  @ApiOkResponse({ type: ResetPasswordResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid reset token or password format',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid, expired, consumed, or reused reset token',
  })
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.passwordResetService.resetPassword(
      body.resetToken,
      body.newPassword,
    );
  }

  private ip(request: Request): string {
    return request.ip || request.socket.remoteAddress || 'unknown';
  }
}
