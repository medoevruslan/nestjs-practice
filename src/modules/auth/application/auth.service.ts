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
      secret: 'secretKey',
      signOptions: { expiresIn: '15m' },
    });
  }

  async login(login: string, password: string) {
    const user = await this.usersRepository.findByLoginOrFail(login);

    if (!this.authConfig.skipPasswordCheck) {
      const isPass = await this.cryptoService.checkPassword(
        password,
        user.password,
      );

      if (!isPass) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    const payload = { login, id: user.id };

    const accessToken = this.jswService.sign(payload);
    const refreshToken = this.jswService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }
}
