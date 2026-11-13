import { Controller, Get, Post, Patch, Delete, Body, Param, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { RateCardsService } from './rate-cards.service';
import { CreateRateCardDto } from './dto/create-rate-card.dto';
import { UpdateRateCardDto } from './dto/update-rate-card.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { RoleSerializerInterceptor } from '../common/interceptors/role-serializer.interceptor';

@ApiTags('People & Rate Cards')
@ApiBearerAuth()
@UseInterceptors(RoleSerializerInterceptor)
@Controller('rate-cards')
export class RateCardsController {
  constructor(private rateCardsService: RateCardsService) {}

  @Get()
  @ApiOperation({ summary: 'List all rate cards in organization' })
  @ApiResponse({ status: 200, description: 'List of rate cards' })
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.rateCardsService.findAll(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single rate card with items' })
  @ApiResponse({ status: 200, description: 'Rate card details' })
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.rateCardsService.findOne(id, user.organizationId);
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Create a new rate card' })
  @ApiResponse({ status: 201, description: 'Rate card created' })
  async create(@Body() dto: CreateRateCardDto, @CurrentUser() user: AuthenticatedUser) {
    return this.rateCardsService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Update an existing rate card' })
  @ApiResponse({ status: 200, description: 'Rate card updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRateCardDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.rateCardsService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Delete a rate card (restricted to Owner)' })
  @ApiResponse({ status: 200, description: 'Rate card deleted' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.rateCardsService.delete(id, user);
  }
}
