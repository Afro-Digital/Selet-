import { Controller, Get, Post, Patch, Delete, Body, Param, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { RoleSerializerInterceptor } from '../common/interceptors/role-serializer.interceptor';

@ApiTags('People & Rate Cards')
@ApiBearerAuth()
@UseInterceptors(RoleSerializerInterceptor)
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List all job roles in organization' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.rolesService.findAll(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single role by ID' })
  @ApiResponse({ status: 200, description: 'Role details' })
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.rolesService.findOne(id, user.organizationId);
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Create a new job role' })
  @ApiResponse({ status: 201, description: 'Role created' })
  async create(@Body() dto: CreateRoleDto, @CurrentUser() user: AuthenticatedUser) {
    return this.rolesService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Update an existing job role' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.rolesService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Delete a job role (restricted to Owner)' })
  @ApiResponse({ status: 200, description: 'Role deleted' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.rolesService.delete(id, user);
  }
}
