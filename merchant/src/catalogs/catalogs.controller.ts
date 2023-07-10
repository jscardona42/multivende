import { Body, Controller,  Post } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';

@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) { }

  @Post()
  async updateBulkStock(@Body() data: any) {
    let warehouses = await this.catalogsService.getStoresAndWareHouses();

    let warehouse_id = warehouses.entries[0]._id;

    return this.catalogsService.processRecords(warehouse_id, data);
  }

}
