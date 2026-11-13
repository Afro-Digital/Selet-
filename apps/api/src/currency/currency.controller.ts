import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrencyService } from './currency.service';
import { SetManualOverrideDto } from './dto/set-manual-override.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Currency Service')
@ApiBearerAuth()
@Controller('currency')
export class CurrencyController {
  constructor(private currencyService: CurrencyService) {}

  @Get('rates')
  @ApiOperation({ summary: 'Get active exchange rates for USD, EUR to ETB base' })
  @ApiResponse({ status: 200, description: 'List of active exchange rates' })
  async getRates(@CurrentUser() user: AuthenticatedUser) {
    return this.currencyService.getRates(user.organizationId);
  }

  @Post('override')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Set manual exchange rate override (beats automatic feed)' })
  @ApiResponse({ status: 200, description: 'Override set and snapshot captured' })
  async setOverride(@Body() dto: SetManualOverrideDto, @CurrentUser() user: AuthenticatedUser) {
    return this.currencyService.setManualOverride(dto, user);
  }

  @Delete('override/:fromCurrency')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Clear manual exchange rate override and revert to automated rate' })
  @ApiResponse({ status: 200, description: 'Override cleared' })
  async clearOverride(
    @Param('fromCurrency') fromCurrency: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.currencyService.clearManualOverride(fromCurrency, user);
  }

  @Post('refresh')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Trigger exchange rate refresh job' })
  @ApiQuery({ name: 'simulateFailure', type: Boolean, required: false })
  @ApiResponse({ status: 200, description: 'Rates refreshed or fallback kept' })
  async refreshRates(
    @CurrentUser() user: AuthenticatedUser,
    @Query('simulateFailure') simulateFailure?: string,
  ) {
    return this.currencyService.refreshRates(user.organizationId, simulateFailure === 'true');
  }

  @Get('history')
  @ApiOperation({ summary: 'Get exchange rate history snapshots' })
  @ApiQuery({ name: 'fromCurrency', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Rate snapshots history' })
  async getHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query('fromCurrency') fromCurrency?: string,
    @Query('limit') limit?: string,
  ) {
    const lim = limit ? parseInt(limit, 10) : 50;
    return this.currencyService.getHistory(user.organizationId, fromCurrency, lim);
  }
}
