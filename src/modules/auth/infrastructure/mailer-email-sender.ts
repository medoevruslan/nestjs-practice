import { AbstractEmailSender } from '../application/port/abstract-email-sender';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerEmailSender extends AbstractEmailSender {
  constructor(private readonly emailService: MailerService) {
    super();
  }

  public async sendEmailConfirmation(
    email: string,
    verificationCode: string,
  ): Promise<void> {
    await this.emailService.sendMail({
      to: email,
      subject: 'Welcome to Nice App! Confirm your Email',
      html: `<h1>Thank for your registration</h1>
              <p>To finish registration please follow the link below:
              <a href="https://some-front.com/confirm-email?code=${verificationCode}">complete registration</a>
              </p>`,
    });
  }

  public async sendPasswordRecovery(
    email: string,
    recoveryCode: string,
  ): Promise<void> {
    await this.emailService.sendMail({
      to: email,
      subject: 'Password recovery',
      html: `<h1>Password recovery</h1>
              <p>To finish password recovery please follow the link below:
              <a href='https://somesite.com/password-recovery?code=${recoveryCode}'>recovery password</a>
      `,
    });
  }
}
