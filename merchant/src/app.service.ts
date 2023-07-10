import { Injectable } from '@nestjs/common';
import * as casual from 'casual';
import * as xlsx from 'xlsx';
import * as path from 'path';

@Injectable()
export class AppService {
  generateProducts(): void {
    const header = [
      'SKU_PADRE',
      'SKU_HIJO',
      'PRODUCTO',
      'DESCRIPCION',
      'MODELO',
      'MARCA',
      'CATEGORIA',
      'COLOR',
      'TAMANO',
      'TEMPORADA',
      'ANCHO',
      'LARGO',
      'ALTO',
      'PESO',
      'POSICION',
      'CANTIDAD_BODEGA_ONLINE',
      'MONEDA',
      'PRECIO_VENTA',
      'PRICING_PRICE_WITH_DISCOUNT',
      'TAGS',
    ];

    const data = [];
    const brands = ['Spalding', 'Golty', 'Adidas', 'Nike', 'Wilson'];
    const colors = ['Negro', 'Naranja', 'Blanco', 'Azul', 'Rojo', 'Gris'];

    for (let i = 0; i < 100000; i++) {
      const skuPadre = `DF${this.generateRandomAlphanumeric(7)}`;
      const skuHijo = '';
      const producto = 'Balón de baloncesto';
      const descripcion = 'Balón de baloncesto recreativo';
      const modelo = 'XX2023';
      const marca = casual.random_element(brands);
      const categoria = '';
      const color = casual.random_element(colors);
      const tamano = 0;
      const temporada = 0;
      const ancho = 0;
      const largo = 0;
      const alto = 0;
      const peso = 0;
      const posicion = 8;
      const cantidadBodegaOnline = casual.integer(1, 10);
      const moneda = 'COP';
      const precioVenta = casual.integer(1000, 1000000);
      const pricingPriceWithDiscount = 0;
      const tags = '';

      const row = [
        skuPadre,
        skuHijo,
        producto,
        descripcion,
        modelo,
        marca,
        categoria,
        color,
        tamano,
        temporada,
        ancho,
        largo,
        alto,
        peso,
        posicion,
        cantidadBodegaOnline,
        moneda,
        precioVenta,
        pricingPriceWithDiscount,
        tags,
      ];

      data.push(row);
    }

    const worksheet = xlsx.utils.aoa_to_sheet([header, ...data]);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');
    
    const filePath = path.join(__dirname, 'products.xlsx');
    xlsx.writeFile(workbook, filePath);
  }

  private generateRandomAlphanumeric(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
