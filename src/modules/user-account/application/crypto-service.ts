import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptoService {
  hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  checkPassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }
}
