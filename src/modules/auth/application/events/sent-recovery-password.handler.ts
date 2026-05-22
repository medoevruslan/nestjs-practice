import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SentRecoveryPasswordEvent } from './sent-recovery-password.event';
import { Inject, Logger } from '@nestjs/common';
import { AbstractEmailSender } from '../port/abstract-email-sender';

@EventsHandler(SentRecoveryPasswordEvent)
export class SentRecoveryPasswordHandler implements IEventHandler<SentRecoveryPasswordEvent> {
  private readonly logger = new Logger(SentRecoveryPasswordHandler.name);

  constructor(@Inject() private readonly emailSender: AbstractEmailSender) {}

  async handle(event: SentRecoveryPasswordEvent) {
    try {
      await this.emailSender.sendPasswordRecovery(event.email, event.code);
      this.logger.log(`Email was sent to ${event.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${event.email}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
