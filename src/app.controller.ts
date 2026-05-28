import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Service health check endpoint' })
  @ApiOkResponse({
    schema: {
      example: {
        status: 'ok',
        service: 'carai-backend',
        timestamp: '2026-04-20T18:00:00.000Z',
      },
    },
  })
  healthCheck() {
    return {
      status: 'ok',
      service: 'carai-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
