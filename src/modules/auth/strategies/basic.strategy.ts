import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { BasicStrategy as Strategy } from 'passport-http'
import { DomainExceptionCode } from "src/core/exceptions/domain-exception-codes";
import { DomainException } from "src/core/exceptions/domain-exceptions";


@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
    constructor(@Inject() private readonly configService: ConfigService) {
        super({ passReqToCallback: true });
    }

    validate(req: Request) {
        const auth = req.headers.authorization

        if (!auth) this.throwUnauthorized()

        const [authType, data] = auth.split(' ');

        if (authType !== 'Basic') this.throwUnauthorized();

        const name = this.configService.get<string>('ADMIN_NAME')
        const passw = this.configService.get<string>('ADMIN_PASSWORD')

        const creds = Buffer.from(data, 'base64').toString('utf-8')

        if (creds !== `${name}:${passw}`) this.throwUnauthorized()

        return true
    }

    private throwUnauthorized(): never {
        throw new DomainException({
            code: DomainExceptionCode.Unauthorized,
            message: 'Invalid credentials',
        });
    }
}