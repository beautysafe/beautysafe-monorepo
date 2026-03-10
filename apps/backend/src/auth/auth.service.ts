import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    try {
      if (!email || !password) return null;
  
      const user = await this.usersService.findByEmail(email.toLowerCase());
      if (!user || !user.password) return null;
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return null;
  
      const { password: _pw, ...result } = user;
      return result;
    } catch (error) {
      console.error('validateUser error:', error);
      throw error;
    }
    
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}