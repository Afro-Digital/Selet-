import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should return health status ok', () => {
    const response = controller.getHealth();
    expect(response.status).toBe('ok');
    expect(response.service).toBe('selet-api');
    expect(response.timestamp).toBeDefined();
  });
});
