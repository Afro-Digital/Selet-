import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CatalogCategory, Payer, UserRole } from '@prisma/client';
import { CatalogService } from './catalog.service';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { RoleSerializerInterceptor } from '../common/interceptors/role-serializer.interceptor';

@ApiTags('Cost Catalog')
@ApiBearerAuth()
@UseInterceptors(RoleSerializerInterceptor)
@Controller('catalog')
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List all cost catalog items with stale indicators' })
  @ApiQuery({ name: 'category', enum: CatalogCategory, required: false })
  @ApiQuery({ name: 'payer', enum: Payer, required: false })
  @ApiQuery({ name: 'isExample', type: Boolean, required: false })
  @ApiResponse({ status: 200, description: 'List of catalog items' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('category') category?: CatalogCategory,
    @Query('payer') payer?: Payer,
    @Query('isExample') isExample?: string,
  ) {
    return this.catalogService.findAll(user.organizationId, {
      category,
      payer,
      isExample: isExample !== undefined ? isExample === 'true' : undefined,
    });
  }

  @Get('audit-stale')
  @ApiOperation({ summary: 'Scan catalog for stale items and generate notifications' })
  @ApiResponse({ status: 200, description: 'List of stale items found and notified' })
  async auditStale(@CurrentUser() user: AuthenticatedUser) {
    return this.catalogService.auditStaleItems(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single catalog item by ID' })
  @ApiResponse({ status: 200, description: 'Catalog item details' })
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.catalogService.findOne(id, user.organizationId);
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Add a new catalog item' })
  @ApiResponse({ status: 201, description: 'Catalog item created' })
  async create(@Body() dto: CreateCatalogItemDto, @CurrentUser() user: AuthenticatedUser) {
    return this.catalogService.create(dto, user);
  }

  @Post('seed-examples')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Seed a removable starter set of software & cloud catalog items' })
  @ApiResponse({ status: 201, description: 'Examples seeded' })
  async seedExamples(@CurrentUser() user: AuthenticatedUser) {
    return this.catalogService.seedExamples(user);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Update catalog item or verify price' })
  @ApiResponse({ status: 200, description: 'Catalog item updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCatalogItemDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.catalogService.update(id, dto, user);
  }

  @Delete('examples')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Delete all seeded example catalog items' })
  @ApiResponse({ status: 200, description: 'Example items deleted' })
  async deleteExamples(@CurrentUser() user: AuthenticatedUser) {
    return this.catalogService.deleteExamples(user);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Delete a catalog item' })
  @ApiResponse({ status: 200, description: 'Catalog item deleted' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.catalogService.delete(id, user);
  }
}
