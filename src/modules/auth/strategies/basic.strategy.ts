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

    validate(req: Request, username: string, password: string) {
        const name = this.configService.get<string>('ADMIN_NAME')
        const passw = this.configService.get<string>('ADMIN_PASSWORD')

        if (name === username && passw === password) return true
        this.throwUnauthorized()

    }

    private throwUnauthorized(): never {
        throw new DomainException({
            code: DomainExceptionCode.Unauthorized,
            message: 'Invalid credentials',
        });
    }
}