import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { Response } from 'express';
import { RegisterUserInputDto } from './input-dto/register-user.input-dto';
import { NewPasswordInputDto } from './input-dto/new-password.input-dto';
import { LoginInputDto } from './input-dto/login.input-dto';
import { EmailConfirmationInputDto } from './input-dto/email.confirmation.input-dto';
import { EmailRecoveryInputDto } from './input-dto/email.recovery.input-dto';

@Controller('auth')
export class AuthController {
  constructor(@Inject() private readonly authService: AuthService) {}

  @Get('me')
  async me() {
    return 'me page';
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginInputDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, accessToken } = await this.authService.login(body);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return { accessToken };
  }

  @Post('registration')
  @HttpCode(HttpStatus.OK)
  async register(@Body() body: RegisterUserInputDto) {
    return this.authService.register(body);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: EmailRecoveryInputDto) {
    return this.authService.recoveryPassword(body);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: NewPasswordInputDto) {
    return this.authService.newPassword(body);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() body: EmailConfirmationInputDto) {
    return this.authService.confirmRegistration(body);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailSending(@Body() body: EmailConfirmationInputDto) {
    return this.authService.confirmRegistration(body);
  }
}
