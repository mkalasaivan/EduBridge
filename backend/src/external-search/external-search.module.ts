import { Module } from '@nestjs/common';
import { ExternalSearchController } from './external-search.controller';
import { ExternalSearchService } from './external-search.service';

@Module({
  controllers: [ExternalSearchController],
  providers: [ExternalSearchService],
  exports: [ExternalSearchService],
})
export class ExternalSearchModule {}
