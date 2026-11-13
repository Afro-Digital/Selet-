import { Controller, Get, Post, Patch, Delete, Body, Param, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PeopleService } from './people.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { RoleSerializerInterceptor } from '../common/interceptors/role-serializer.interceptor';

@ApiTags('People & Rate Cards')
@ApiBearerAuth()
@UseInterceptors(RoleSerializerInterceptor)
@Controller('people')
export class PeopleController {
  constructor(private peopleService: PeopleService) {}

  @Get()
  @ApiOperation({
    summary: 'List all team members (cost/salary fields automatically filtered by role)',
  })
  @ApiResponse({ status: 200, description: 'Filtered list of people' })
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.peopleService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single team member details (filtered by role)' })
  @ApiResponse({ status: 200, description: 'Person details' })
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.peopleService.findOne(id, user);
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Add a new team member (restricted to Owner and PM)' })
  @ApiResponse({ status: 201, description: 'Person successfully added' })
  async create(@Body() dto: CreatePersonDto, @CurrentUser() user: AuthenticatedUser) {
    return this.peopleService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Update a team member (restricted to Owner and PM)' })
  @ApiResponse({ status: 200, description: 'Person successfully updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePersonDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.peopleService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Delete a team member (restricted to Owner)' })
  @ApiResponse({ status: 200, description: 'Person successfully deleted' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.peopleService.delete(id, user);
  }
}
