import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'System health check' })
  getHealth() {
    return {
      status: 'ok',
      service: 'selet-api',
      timestamp: new Date().toISOString(),
    };
  }
}
