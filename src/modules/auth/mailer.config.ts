import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MailerOptions,
  MailerOptionsFactory,
} from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';

@Injectable()
export class MailerConfig implements MailerOptionsFactory {
  user: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;

  constructor(@Inject() private config: ConfigService) {
    this.user = this.config.get('GOOGLE_MAIL_USER') ?? '';
    this.clientId = this.config.get('GOOGLE.CLIENT_ID') ?? '';
    this.clientSecret = this.config.get('GOOGLE.CLIENT_SECRET') ?? '';
    this.refreshToken = this.config.get('GOOGLE.REFRESH_TOKEN') ?? '';
  }

  createMailerOptions(): MailerOptions {
    return {
      transport: {
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: this.user,
          clientId: this.clientId,
          clientSecret: this.clientSecret,
          refreshToken: this.refreshToken,
        },
      },
      defaults: {
        from: `Blog service <${this.user}>`,
      },
      template: {
        adapter: new HandlebarsAdapter(),
      },
    };
  }
}
