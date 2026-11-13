import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Res,
  Header,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { MILESTONE_PRESETS } from './dto/quote-milestone.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../common/decorators/current-user.decorator';

@ApiTags('quotes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get('quotes/presets/milestones')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'List standard payment milestone presets' })
  getMilestonePresets() {
    return MILESTONE_PRESETS;
  }

  @Post('projects/:projectId/versions/:versionId/quotes')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Create an immutable quote snapshot from pricing scenario' })
  createQuote(
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
    @Body() dto: CreateQuoteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.quotesService.createQuote(projectId, versionId, dto, user);
  }

  @Get('projects/:projectId/quotes')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'List all quotes for a project' })
  listQuotes(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.quotesService.listQuotes(projectId, user);
  }

  @Get('quotes/:id')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Get quote details and snapshot' })
  getQuote(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.quotesService.getQuote(id, user);
  }

  @Put('quotes/:id')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Update a draft quote before issuance' })
  updateQuote(
    @Param('id') id: string,
    @Body() dto: UpdateQuoteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.quotesService.updateQuote(id, dto, user);
  }

  @Post('quotes/:id/issue')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Issue quote (locks it into an immutable snapshot)' })
  issueQuote(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.quotesService.issueQuote(id, user);
  }

  @Get('quotes/:id/html')
  @Roles(UserRole.OWNER, UserRole.PM)
  @Header('Content-Type', 'text/html; charset=utf-8')
  @ApiOperation({ summary: 'Render quote as branded Afro Digital HTML' })
  async renderHtml(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.quotesService.renderQuoteHtml(id, user);
  }

  @Get('quotes/:id/pdf')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Generate Afro Digital PDF via Playwright' })
  async renderPdf(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ) {
    const quote = await this.quotesService.getQuote(id, user);
    const pdfBuffer = await this.quotesService.renderQuotePdf(id, user);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${quote.quoteNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Get('quotes/:id/verify-immutability')
  @Roles(UserRole.OWNER, UserRole.PM)
  @ApiOperation({ summary: 'Verify that an issued quote is frozen and immutable' })
  verifyImmutability(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.quotesService.verifyImmutability(id, user);
  }
}
