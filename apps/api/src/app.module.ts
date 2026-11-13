import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { PeopleModule } from './people/people.module';
import { OrganizationModule } from './organization/organization.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { RoleSerializerInterceptor } from './common/interceptors/role-serializer.interceptor';

@Module({
  imports: [PrismaModule, AuditModule, AuthModule, PeopleModule, OrganizationModule, HealthModule],
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
