import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './auth/roles.guard';
import { PasswordModule } from './password/password.module';
import { RedisModule } from './redis/redis.module';
import { SanitizationMiddleware } from './sanitization/sanitization.middleware';
import { SanitizationModule } from './sanitization/sanitization.module';
import { SessionModule } from './session/session.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ??
          'mongodb://localhost:27017/autolavado',
      }),
    }),
    RedisModule,
    SessionModule,
    PasswordModule,
    SanitizationModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global guards: every endpoint requires a token unless @SkipAuth();
    // @Roles(...) restricts by role on top of that.
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // NoSQL-injection defense: strips `$`-prefixed keys from params/body/query on every route.
    consumer.apply(SanitizationMiddleware).forRoutes('{*splat}');
  }
}
