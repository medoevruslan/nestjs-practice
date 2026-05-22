import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from './user-registered.event';
import { Inject, Logger } from '@nestjs/common';
import { AbstractEmailSender } from '../port/abstract-email-sender';

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler implements IEventHandler<UserRegisteredEvent> {
  private readonly logger = new Logger(UserRegisteredHandler.name);

  constructor(@Inject() private readonly emailSender: AbstractEmailSender) {}

  async handle(event: UserRegisteredEvent) {
    try {
      await this.emailSender.sendEmailConfirmation(event.email, event.code);
      this.logger.log(`Email was sent to ${event.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${event.email}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
