import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

/**
 * Revocable sessions backed by Redis. A JWT is only valid while its
 * `session:<userId>:<jti>` key exists; deleting the key logs the session out.
 */
@Injectable()
export class SessionService {
  constructor(private readonly redisService: RedisService) {}

  private key(userId: string, jti: string): string {
    return `session:${userId}:${jti}`;
  }

  async create(userId: string, jti: string, ttlSeconds: number): Promise<void> {
    await this.redisService.set(
      this.key(userId, jti),
      JSON.stringify({ createdAt: new Date().toISOString() }),
      ttlSeconds,
    );
  }

  async isActive(userId: string, jti: string): Promise<boolean> {
    return this.redisService.exists(this.key(userId, jti));
  }

  async destroy(userId: string, jti: string): Promise<void> {
    await this.redisService.del(this.key(userId, jti));
  }

  async destroyAll(userId: string): Promise<number> {
    return this.redisService.delByPattern(`session:${userId}:*`);
  }
}
