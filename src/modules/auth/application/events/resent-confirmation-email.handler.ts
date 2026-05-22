import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ResentConfirmationEmailEvent } from './resent-confirmation-email.event';
import { Inject, Logger } from '@nestjs/common';
import { AbstractEmailSender } from '../port/abstract-email-sender';

@EventsHandler(ResentConfirmationEmailEvent)
export class ResentConfirmationEmailHandler implements IEventHandler<ResentConfirmationEmailEvent> {
  private readonly logger = new Logger(ResentConfirmationEmailHandler.name);

  constructor(@Inject() private readonly emailSender: AbstractEmailSender) {}

  async handle(event: ResentConfirmationEmailEvent) {
    try {
      await this.emailSender.sendEmailConfirmation(event.email, event.code);
      this.logger.log(`Email was resent to ${event.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to resend email to ${event.email}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
