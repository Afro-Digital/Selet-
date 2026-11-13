import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { CurrencyModule } from '../currency/currency.module';
import { EstimatesModule } from '../estimates/estimates.module';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';
import { PdfService } from './pdf.service';

@Module({
  imports: [PrismaModule, AuditModule, CurrencyModule, EstimatesModule],
  controllers: [QuotesController],
  providers: [QuotesService, PdfService],
  exports: [QuotesService, PdfService],
})
export class QuotesModule {}
