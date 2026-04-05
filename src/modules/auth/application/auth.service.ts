import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../../user-account/infrastructure/users.repository';
import { CryptoService } from '../../user-account/application/crypto-service';
import { AuthConfig } from '../auth.config';

@Injectable()
export class AuthService {
  private readonly jswService: JwtService;

  constructor(
    @Inject() private readonly usersRepository: UsersRepository,
    @Inject() private readonly cryptoService: CryptoService,
    @Inject() private readonly authConfig: AuthConfig,
  ) {
    this.jswService = new JwtService({
      secret: this.authConfig.jwtSecret,
      signOptions: { expiresIn: this.authConfig.expiresIn },
    });
  }

  async login(email: string, password: string) {
    const user = await this.usersRepository.findByEmailOrFail(email);

    if (!this.authConfig.skipPasswordCheck) {
      const isPass = await this.cryptoService.checkPassword(
        password,
        user.password,
      );

      if (!isPass) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    const payload = { email, id: user.id };

    const accessToken = this.jswService.sign(payload);
    const refreshToken = this.jswService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }
}
