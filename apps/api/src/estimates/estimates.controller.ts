import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Put,
  Body,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { EstimatesService } from './estimates.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { UpdateFeatureHoursDto } from './dto/update-feature-hours.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { RoleSerializerInterceptor } from '../common/interceptors/role-serializer.interceptor';

@ApiTags('Projects & Estimates')
@ApiBearerAuth()
@UseInterceptors(RoleSerializerInterceptor)
@Controller('projects')
export class EstimatesController {
  constructor(private estimatesService: EstimatesService) {}

  // ==========================================
  // STARTER TEMPLATES
  // ==========================================

  @Get('templates')
  @ApiOperation({ summary: 'Get all starter estimation templates' })
  @ApiResponse({ status: 200, description: 'List of starter templates' })
  async getTemplates(@CurrentUser() user: AuthenticatedUser) {
    return this.estimatesService.getStarterTemplates(user);
  }

  @Post('templates/seed')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Seed standard 6 starter templates' })
  @ApiResponse({ status: 201, description: 'Templates successfully seeded' })
  async seedTemplates(@CurrentUser() user: AuthenticatedUser) {
    return this.estimatesService.seedStarterTemplates(user);
  }

  @Delete('templates/:id')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Delete a template' })
  @ApiResponse({ status: 200, description: 'Template deleted' })
  async deleteTemplate(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.estimatesService.deleteTemplate(id, user);
  }

  @Post('from-template/:templateId')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Create a new project from a starter template' })
  @ApiResponse({ status: 201, description: 'Project created from template' })
  async createFromTemplate(
    @Param('templateId') templateId: string,
    @Body('name') name: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.estimatesService.createFromTemplate(templateId, name, user);
  }

  // ==========================================
  // PROJECTS CRUD
  // ==========================================

  @Get()
  @ApiOperation({ summary: 'List all projects for the organization' })
  @ApiQuery({ name: 'isTemplate', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of projects' })
  async findAll(
    @Query('isTemplate') isTemplateStr: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const isTemplate = isTemplateStr !== undefined ? isTemplateStr === 'true' : undefined;
    return this.estimatesService.findAllProjects(user, isTemplate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single project with WBS modules and features' })
  @ApiResponse({ status: 200, description: 'Project details' })
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.estimatesService.findOneProject(id, user);
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created' })
  async create(@Body() dto: CreateProjectDto, @CurrentUser() user: AuthenticatedUser) {
    return this.estimatesService.createProject(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, description: 'Project updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.estimatesService.updateProject(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 200, description: 'Project deleted' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.estimatesService.deleteProject(id, user);
  }

  // ==========================================
  // MODULES (WBS Nesting)
  // ==========================================

  @Post(':projectId/modules')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Create a module in a project (supports parentId for WBS)' })
  @ApiResponse({ status: 201, description: 'Module created' })
  async createModule(
    @Param('projectId') projectId: string,
    @Body() dto: CreateModuleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.estimatesService.createModule(projectId, dto, user);
  }

  @Patch('modules/:id')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Update a module' })
  @ApiResponse({ status: 200, description: 'Module updated' })
  async updateModule(
    @Param('id') id: string,
    @Body() dto: UpdateModuleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.estimatesService.updateModule(id, dto, user);
  }

  @Delete('modules/:id')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Delete a module' })
  @ApiResponse({ status: 200, description: 'Module deleted' })
  async deleteModule(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.estimatesService.deleteModule(id, user);
  }

  // ==========================================
  // FEATURES
  // ==========================================

  @Post('modules/:moduleId/features')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Create a feature inside a module' })
  @ApiResponse({ status: 201, description: 'Feature created' })
  async createFeature(
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateFeatureDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.estimatesService.createFeature(moduleId, dto, user);
  }

  @Patch('features/:id')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Update a feature' })
  @ApiResponse({ status: 200, description: 'Feature updated' })
  async updateFeature(
    @Param('id') id: string,
    @Body() dto: UpdateFeatureDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.estimatesService.updateFeature(id, dto, user);
  }

  @Delete('features/:id')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Delete a feature' })
  @ApiResponse({ status: 200, description: 'Feature deleted' })
  async deleteFeature(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.estimatesService.deleteFeature(id, user);
  }

  // ==========================================
  // FEATURE HOURS (Role-based Developer Guard)
  // ==========================================

  @Put('features/:featureId/hours')
  @ApiOperation({
    summary: 'Update role hours on a feature (Developers restricted to assigned features only)',
  })
  @ApiResponse({ status: 200, description: 'Feature hours updated' })
  async updateFeatureHours(
    @Param('featureId') featureId: string,
    @Body() dto: UpdateFeatureHoursDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.estimatesService.updateFeatureHours(featureId, dto, user);
  }

  // ==========================================
  // ROLLUP COMPUTATION
  // ==========================================

  @Get(':id/rollup')
  @ApiOperation({
    summary:
      'Get live rollup of hours per role and module (Developer receives hours only, no costs)',
  })
  @ApiResponse({ status: 200, description: 'Project estimate rollup' })
  async getRollup(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.estimatesService.getRollup(id, user);
  }
}
