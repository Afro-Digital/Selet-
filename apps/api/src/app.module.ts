import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { PeopleModule } from './people/people.module';
import { RateCardsModule } from './rate-cards/rate-cards.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CatalogModule } from './catalog/catalog.module';
import { CurrencyModule } from './currency/currency.module';
import { EstimatesModule } from './estimates/estimates.module';
import { QuotesModule } from './quotes/quotes.module';
import { ReportsModule } from './reports/reports.module';
import { OrganizationModule } from './organization/organization.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { RoleSerializerInterceptor } from './common/interceptors/role-serializer.interceptor';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    AuthModule,
    RolesModule,
    PeopleModule,
    RateCardsModule,
    NotificationsModule,
    CatalogModule,
    CurrencyModule,
    EstimatesModule,
    QuotesModule,
    ReportsModule,
    OrganizationModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RoleSerializerInterceptor,
    },
  ],
})
export class AppModule {}
