import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check application health status' })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2023-12-01T10:00:00Z' },
        uptime: { type: 'number', example: 12345 },
        environment: { type: 'string', example: 'development' },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  check() {
    return this.healthService.check();
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Get detailed health information including database status' })
  @ApiResponse({
    status: 200,
    description: 'Detailed health information',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2023-12-01T10:00:00Z' },
        uptime: { type: 'number', example: 12345 },
        environment: { type: 'string', example: 'development' },
        version: { type: 'string', example: '1.0.0' },
        database: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            connection: { type: 'boolean', example: true },
            responseTime: { type: 'number', example: 15 },
          },
        },
        memory: {
          type: 'object',
          properties: {
            used: { type: 'number', example: 123456789 },
            free: { type: 'number', example: 987654321 },
            total: { type: 'number', example: 1111111110 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  detailedCheck() {
    return this.healthService.detailedCheck();
  }
}