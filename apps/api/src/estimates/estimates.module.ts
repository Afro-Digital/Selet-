import { Module } from '@nestjs/common';
import { EstimatesController } from './estimates.controller';
import { EstimatesService } from './estimates.service';
import { ScaleService } from './scale.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [EstimatesController],
  providers: [EstimatesService, ScaleService],
  exports: [EstimatesService, ScaleService],
})
export class EstimatesModule {}
