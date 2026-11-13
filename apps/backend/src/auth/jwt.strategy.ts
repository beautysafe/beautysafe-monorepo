import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

type AccessTokenPayload = {
  sub: number;
  username: string;
  role: UserRole;
  ver?: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecret',
    });
  }

  async validate(payload: AccessTokenPayload) {
    const user = await this.usersService.findAuthById(payload.sub);
    if (!user || (payload.ver ?? 0) !== (user.authVersion ?? 0)) {
      throw new UnauthorizedException('Access token is no longer valid');
    }
    return { userId: payload.sub, email: payload.username, role: payload.role };
  }
}
