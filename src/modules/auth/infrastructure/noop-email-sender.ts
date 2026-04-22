/* eslint-disable @typescript-eslint/no-unused-vars */
import { AbstractEmailSender } from '../application/port/abstract-email-sender';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NoopEmailSender extends AbstractEmailSender {
  async sendEmailConfirmation(
    _email: string,
    _verificationCode: string,
  ): Promise<void> {}

  async sendPasswordRecovery(
    _email: string,
    _recoveryCode: string,
  ): Promise<void> {}
}
