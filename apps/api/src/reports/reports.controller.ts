import {
  Controller,
  Get,
  Query,
  UseGuards,
  Res,
  Header,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ReportsService } from './reports.service';
import {
  ReportQueryDto,
  ExportCsvQueryDto,
  ReportType,
} from './dto/report-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../common/decorators/current-user.decorator';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({
    summary: 'Get high-level financial report summary reconciled with quotes',
  })
  getSummary(
    @Query() query: ReportQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reportsService.getSummary(query, user);
  }

  @Get('projects')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Get profit per project report' })
  getProjectReports(
    @Query() query: ReportQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reportsService.getProjectReports(query, user);
  }

  @Get('clients')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Get profit per client report' })
  getClientReports(
    @Query() query: ReportQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reportsService.getClientReports(query, user);
  }

  @Get('team-members')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({
    summary: 'Get profit contribution per team member based on estimate allocation',
  })
  getTeamMemberReports(
    @Query() query: ReportQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reportsService.getTeamMemberReports(query, user);
  }

  @Get('export-csv')
  @Roles(UserRole.OWNER, UserRole.PM)
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @ApiOperation({ summary: 'Export financial reports as downloadable CSV' })
  async exportCsv(
    @Query() query: ExportCsvQueryDto,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ) {
    const type = query.type || ReportType.PROJECTS;
    const csvData = await this.reportsService.exportCsv(type, query, user);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="selet-report-${type}-${new Date().toISOString().split('T')[0]}.csv"`,
    );
    res.send(csvData);
  }
}
