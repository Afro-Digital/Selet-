import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export enum ReportType {
  PROJECTS = 'projects',
  CLIENTS = 'clients',
  TEAM_MEMBERS = 'team-members',
}

export enum ReportStatusFilter {
  ALL = 'ALL',
  ISSUED = 'ISSUED',
  DRAFT = 'DRAFT',
  ACCEPTED = 'ACCEPTED',
}

export class ReportQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ReportStatusFilter)
  status?: ReportStatusFilter = ReportStatusFilter.ALL;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;
}

export class ExportCsvQueryDto extends ReportQueryDto {
  @IsOptional()
  @IsEnum(ReportType)
  type: ReportType = ReportType.PROJECTS;
}
