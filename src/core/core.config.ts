import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IsStringWithTrim } from "./decorators/validation/is-string-with-trim";
import { IsEnum, IsNumber } from "class-validator";


enum Environment {
    PRODUCTION = 'production',
    DEVELOPMENT = 'develpopment',
    STAGING = 'staging',
    TESTING = 'testing'
}

@Injectable()
export class CoreConfig {
    @IsNumber()
    port: number = Number(this.configService.get('PORT'));

    @IsStringWithTrim(1)
    mongoUri: string = String(this.configService.get('MONGODB_URI'))

    @IsEnum(Environment)
    env: string = String(this.configService.get('NODE_ENV'))

    constructor(private readonly configService: ConfigService) {

    }
}