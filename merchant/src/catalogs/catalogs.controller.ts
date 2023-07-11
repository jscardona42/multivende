import { Body, Controller, Get, Post } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';

@Controller('catalogs')
export class CatalogsController {
  constructor(
    private readonly catalogsService: CatalogsService,
  ) { }

  @Post()
  async handleRecords(@Body() data: any[]): Promise<void> {
    await this.catalogsService.saveBulkStock(data);
  }

}
