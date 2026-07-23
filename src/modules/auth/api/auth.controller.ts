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
import { Request, Response } from 'express';
import { RegisterUserInputDto } from './input-dto/register-user.input-dto';
import { NewPasswordInputDto } from './input-dto/new-password.input-dto';
import { LoginInputDto } from './input-dto/login.input-dto';
import {
  EmailConfirmationInputDto,
  RegistrationConfirmationInputDto,
} from './input-dto/email.confirmation.input-dto';
import { PasswordRecoveryInputDto } from './input-dto/password-recovery-input.dto';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../application/usecases/register-user.usecase';
import { LoginUserCommand } from '../application/usecases/login-user.usecase';
import { RecoveryPasswordCommand } from '../application/usecases/recovery-password.usecase';
import { ConfirmRegistrationCommand } from '../application/usecases/confirm-registration.usecase';
import { ResendConfirmationCommand } from '../application/usecases/resend-confirmation-email.usecase';
import { NewPasswordCommand } from '../application/usecases/new-password.usecase';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUserId } from 'src/core/decorators/auth/create-param.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    @Inject() private readonly authService: AuthService,
    @Inject() private readonly commandBus: CommandBus,
  ) {}

  @SkipThrottle()
  @ApiBearerAuth('bearer')
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUserId() userId: string) {
    return this.authService.me(userId);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginInputDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, accessToken } = await this.commandBus.execute<
      LoginUserCommand,
      { refreshToken: string; accessToken: string }
    >(new LoginUserCommand(body));

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
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: PasswordRecoveryInputDto) {
    await this.commandBus.execute(new RecoveryPasswordCommand(body));
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: NewPasswordInputDto) {
    await this.commandBus.execute(new NewPasswordCommand(body));
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body() body: RegistrationConfirmationInputDto,
  ) {
    await this.commandBus.execute(new ConfirmRegistrationCommand(body.code));
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() body: EmailConfirmationInputDto) {
    await this.commandBus.execute(new ResendConfirmationCommand(body.email));
  }
}
