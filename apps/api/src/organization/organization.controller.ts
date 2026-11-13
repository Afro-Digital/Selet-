import { Controller, Get, Patch, Body, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { OrganizationService } from './organization.service';
import { UpdateFloorsDto } from './dto/update-floors.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { RoleSerializerInterceptor } from '../common/interceptors/role-serializer.interceptor';

@ApiTags('Organization & Settings')
@ApiBearerAuth()
@UseInterceptors(RoleSerializerInterceptor)
@Controller('organization')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Get()
  @ApiOperation({ summary: 'Get current organization details' })
  @ApiResponse({ status: 200, description: 'Organization profile' })
  async getOrganization(@CurrentUser() user: AuthenticatedUser) {
    return this.organizationService.getOrganization(user);
  }

  @Patch('floors')
  @Roles(UserRole.OWNER) // STRICTLY restricted to Owner! PM receives 403 Forbidden
  @ApiOperation({ summary: 'Update organization-wide margin floors and targets (Owner only)' })
  @ApiResponse({ status: 200, description: 'Floors updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Project Managers cannot modify margin floors',
  })
  async updateFloors(@Body() dto: UpdateFloorsDto, @CurrentUser() user: AuthenticatedUser) {
    return this.organizationService.updateFloors(dto, user);
  }
}
