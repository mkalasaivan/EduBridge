import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ExternalSearchService, ExternalSearchResult } from './external-search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('external-search')
@UseGuards(JwtAuthGuard)
export class ExternalSearchController {
  constructor(private readonly externalSearchService: ExternalSearchService) {}

  @Get()
  async search(@Query('q') query: string): Promise<ExternalSearchResult[]> {
    if (!query || query.length < 2) return [];
    return this.externalSearchService.searchAll(query);
  }
}
