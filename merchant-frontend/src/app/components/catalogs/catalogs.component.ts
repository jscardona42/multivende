import { Component } from '@angular/core';
import { CatalogsService } from '../services/catalogs.service';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-catalogs',
  templateUrl: './catalogs.component.html',
  styleUrls: ['./catalogs.component.css']
})

export class CatalogsComponent {

  processingMessage: string = "";

  constructor(
    private catalogsService: CatalogsService,
    private router: Router
  ) { }

  loadExcelFile() {
    this.processingMessage = '';
    const inputElement = document.getElementById('excelFileInput') as HTMLInputElement;
    inputElement.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const fileReader = new FileReader();
        fileReader.onload = (e: any) => {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const headers = ['SKU', 'CANTIDAD'];
          const data: any = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (!this.validateHeaders(data[0], headers)) {
            alert('El archivo no contiene las cabeceras SKU y CANTIDAD.');
            return;
          }

          const values = this.extractColumns(data, headers);
          console.log(values);
          this.updateBulkCatalogs(values);
        };
        fileReader.readAsBinaryString(file);
      }
    };

    inputElement.click();
  }

  validateHeaders(row: any[], headers: string[]): boolean {
    return headers.every(header => row.includes(header));
  }

  extractColumns(data: any[][], headers: string[]): any[] {
    const headerIndices = headers.map(header => data[0].indexOf(header));
    const transformedValues: any[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const extractedRow: any = {};

      headerIndices.forEach(index => {
        const header = headers[headerIndices.indexOf(index)];
        const propertyName = header === 'SKU' ? 'code' : 'amount';
        extractedRow[propertyName] = row[index];
      });

      transformedValues.push(extractedRow);
    }

    return transformedValues;
  }

  updateBulkCatalogs(values: any) {
    this.processingMessage = 'Enviando registros...';

    this.catalogsService.updateBulkCatalogs(values).subscribe({
      next: (data) => {
        this.processingMessage = 'Registros procesados correctamente';
      },
      error: (err) => {
        this.processingMessage = 'Error al procesar los registros';
      },
    });
  }
}
