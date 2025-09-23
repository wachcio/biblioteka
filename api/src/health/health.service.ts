import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  async detailedCheck() {
    const basicHealth = await this.check();

    // Check database connection
    let databaseHealth;
    try {
      const startTime = Date.now();
      await this.userRepository.query('SELECT 1');
      const responseTime = Date.now() - startTime;

      databaseHealth = {
        status: 'ok',
        connection: true,
        responseTime,
      };
    } catch (error) {
      databaseHealth = {
        status: 'error',
        connection: false,
        error: error.message,
      };
    }

    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const memoryHealth = {
      used: memoryUsage.heapUsed,
      free: memoryUsage.heapTotal - memoryUsage.heapUsed,
      total: memoryUsage.heapTotal,
      external: memoryUsage.external,
      rss: memoryUsage.rss,
    };

    return {
      ...basicHealth,
      database: databaseHealth,
      memory: memoryHealth,
    };
  }
}