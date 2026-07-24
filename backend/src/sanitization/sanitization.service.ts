import { Injectable } from '@nestjs/common';
import sanitize from 'mongo-sanitize';

@Injectable()
export class SanitizationService {
  /**
   * Removes keys starting with `$` (MongoDB operators) from nested objects
   * and arrays, in place. It mutates the received value because in Express 5
   * `req.query` is a getter and cannot be reassigned.
   */
  sanitize<T>(value: T): T {
    return sanitize(value);
  }
}
