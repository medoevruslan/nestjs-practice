import { registerDecorator, ValidationOptions } from "class-validator";
import ms from 'ms'

export function IsMsDuration(options?: ValidationOptions) {
    return (object: object, propertyName: string): void => {
        registerDecorator({
            name: 'IsMsDuration',
            target: object.constructor,
            propertyName,
            options,
            validator: {
                validate(value: unknown): boolean {
                    if (typeof value !== 'string' || value.trim() !== value) {
                        return false
                    }

                    try {
                        const duration = ms(value as ms.StringValue);
                        return typeof duration === 'number' && duration > 0;
                    } catch {
                        return false
                    }
                },

                defaultMessage(): string {
                    return '$property must be a positive duration such as 15m, 2h, or 7d';
                },
            }
        })
    }

}