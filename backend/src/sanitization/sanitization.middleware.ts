import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { SanitizationService } from './sanitization.service';

@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  constructor(private readonly sanitizeService: SanitizationService) {}

  use(req: Request, res: Response, next: NextFunction) {
    this.sanitizeService.sanitize(req.params);
    this.sanitizeService.sanitize(req.body);
    this.sanitizeService.sanitize(req.query);
    next();
  }
}
