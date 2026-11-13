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
  HttpCode,
  HttpStatus,
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
import { ScaleEstimateInputDto } from './dto/scale-estimate.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';
import { UpdateScaleItemsDto } from './dto/update-scale-items.dto';
import { UpdatePricingScenarioDto } from './dto/update-pricing-scenario.dto';
import { MarginBalancerRequestDto } from './dto/margin-balancer-request.dto';
import { TargetBudgetRequestDto } from './dto/target-budget-request.dto';
import { ApplyDiscountRequestDto } from './dto/apply-discount-request.dto';
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

  // ==========================================
  // RISK & OVERHEAD
  // ==========================================

  @Get(':id/risk')
  @ApiOperation({ summary: 'Get risk factors, contingency, and overhead rates' })
  @ApiResponse({ status: 200, description: 'Risk and overhead configuration' })
  async getRisk(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.estimatesService.getRiskAndOverhead(id, undefined, user);
  }

  @Get(':id/versions/:versionId/risk')
  @ApiOperation({ summary: 'Get risk factors and overhead for a specific estimate version' })
  @ApiResponse({ status: 200, description: 'Risk and overhead configuration' })
  async getVersionRisk(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.estimatesService.getRiskAndOverhead(id, versionId, user);
  }

  @Put(':id/versions/:versionId/risk')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Update risk factors, contingency rate, and overhead rate' })
  @ApiResponse({ status: 200, description: 'Risk configuration updated' })
  async updateRisk(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Body() dto: UpdateRiskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.estimatesService.updateRiskAndOverhead(id, versionId, dto, user);
  }

  // ==========================================
  // SCALE ESTIMATOR
  // ==========================================

  @Post(':id/versions/:versionId/scale/estimate')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({
    summary:
      'Generate suggested infrastructure, gateway percentage fees, and recurring costs based on user scale',
  })
  @ApiResponse({ status: 200, description: 'Scale suggestions generated with assumptions' })
  async estimateScale(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Body() dto: ScaleEstimateInputDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.estimatesService.estimateScale(id, versionId, dto, user);
  }

  @Put(':id/versions/:versionId/scale/items')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({
    summary:
      'Update or override recurring scale items (toggle inclusion, edit amount, change payer)',
  })
  @ApiResponse({ status: 200, description: 'Scale items updated' })
  async updateScaleItems(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Body() dto: UpdateScaleItemsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.estimatesService.updateScaleItems(id, versionId, dto, user);
  }

  // ==========================================
  // FULL COST BREAKDOWN SUMMARY
  // ==========================================

  @Get(':id/cost-summary')
  @ApiOperation({
    summary:
      'Get complete cost breakdown: labor + tools + agency infra + third-party + risk + overhead + client recurring (costs stripped for Developer)',
  })
  @ApiResponse({ status: 200, description: 'Complete project cost summary' })
  async getCostSummary(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.estimatesService.getCostSummary(id, undefined, user);
  }

  @Get(':id/versions/:versionId/cost-summary')
  @ApiOperation({
    summary: 'Get complete cost breakdown for a specific version (costs stripped for Developer)',
  })
  @ApiResponse({ status: 200, description: 'Complete project cost summary' })
  async getVersionCostSummary(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.estimatesService.getCostSummary(id, versionId, user);
  }

  // ==========================================
  // STAGE 9: PRICING SCENARIOS & MARGIN BALANCER
  // ==========================================

  @Get(':id/versions/:versionId/pricing')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({
    summary:
      'Get pricing scenarios (Low, Recommended, High), market comparison, and live margin balancer lines',
  })
  @ApiResponse({ status: 200, description: 'Pricing scenarios and balancer data' })
  async getPricingScenario(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.estimatesService.getPricingScenario(id, versionId, user);
  }

  @Put(':id/versions/:versionId/pricing')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({
    summary: 'Update pricing scenarios, margins, market rate range, and owner approval',
  })
  @ApiResponse({ status: 200, description: 'Pricing scenario updated' })
  async updatePricingScenario(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Body() dto: UpdatePricingScenarioDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.estimatesService.updatePricingScenario(id, versionId, dto, user);
  }

  @Post(':id/versions/:versionId/pricing/balance')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({
    summary: 'Margin Balancer: lock blended margin, shift margin between lines, check guardrails',
  })
  @ApiResponse({ status: 200, description: 'Balanced margins computed' })
  async balanceMargins(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Body() dto: MarginBalancerRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.estimatesService.balanceMargins(id, versionId, dto, user);
  }

  @Post(':id/versions/:versionId/pricing/target-price')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({
    summary:
      'Target price mode: client states a budget, recompute blended margin and line allocation',
  })
  @ApiResponse({ status: 200, description: 'Target price distribution computed' })
  async targetPrice(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Body() dto: TargetBudgetRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.estimatesService.targetPrice(id, versionId, dto, user);
  }

  @Post(':id/versions/:versionId/pricing/discount')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({
    summary: 'What-if discount: apply a percentage discount to total project or a specific line',
  })
  @ApiResponse({ status: 200, description: 'Discounted scenario computed' })
  async applyDiscount(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Body() dto: ApplyDiscountRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.estimatesService.applyDiscountScenario(id, versionId, dto, user);
  }

  @Post(':id/versions/:versionId/pricing/approve-below-floor')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary:
      'Approve below-floor pricing (Owner only) allowing quote saving below commercial margin floor',
  })
  @ApiResponse({ status: 200, description: 'Below-floor pricing approved' })
  async approveBelowFloor(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.estimatesService.approveBelowFloor(id, versionId, user);
  }
}
