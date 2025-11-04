import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const token = await this.generateToken({
      userId: user.id,
      role: user.role,
    });
    return token;
  }

  async generateToken(payload: any) {
    return this.jwtService.sign(payload);
  }

  async verifyPassword(password: string, hashed: string) {
    return bcrypt.compare(password, hashed);
  }
}
