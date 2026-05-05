import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { Response, Request } from 'express';
import { RegisterUserInputDto } from './input-dto/register-user.input-dto';
import { NewPasswordInputDto } from './input-dto/new-password.input-dto';
import { LoginInputDto } from './input-dto/login.input-dto';
import { EmailConfirmationInputDto } from './input-dto/email.confirmation.input-dto';
import { PasswordRecoveryInputDto } from './input-dto/password-recovery-input.dto';
import { AuthGuard } from '../guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(@Inject() private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.authService.me(user.id);
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() body: RegisterUserInputDto) {
    return this.authService.register(body);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: PasswordRecoveryInputDto) {
    return this.authService.recoveryPassword(body);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: NewPasswordInputDto) {
    return this.authService.newPassword(body);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() body: { code: string }) {
    return this.authService.confirmRegistration(body);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() body: EmailConfirmationInputDto) {
    return this.authService.resendEmailConfirmation(body.email);
  }
}
