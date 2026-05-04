import { DomainExceptionCode } from './domain-exception-codes';

export class DomainException extends Error {
  code: DomainExceptionCode;
  message: string;
  extensions: Extensions[];

  constructor(errorInfo: {
    code: DomainExceptionCode;
    message: string;
    extensions?: Extensions[];
  }) {
    super(errorInfo.message);
    this.message = errorInfo.message;
    this.code = errorInfo.code;
    this.extensions = errorInfo.extensions ?? [];
  }
}

export type Extensions = { field: string; message: string };

export type ErrorResponseBody = {
  timestamp: string;
  path: string | null;
  message: string;
  code: DomainExceptionCode;
  extensions?: Extensions[];
};
