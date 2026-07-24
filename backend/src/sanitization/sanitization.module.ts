import { Module } from '@nestjs/common';
import { SanitizationMiddleware } from './sanitization.middleware';
import { SanitizationService } from './sanitization.service';

@Module({
  providers: [SanitizationService, SanitizationMiddleware],
  exports: [SanitizationService, SanitizationMiddleware],
})
export class SanitizationModule {}
