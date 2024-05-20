import { Injectable } from '@angular/core';
import moment from 'moment';
import { IProduct } from 'src/app/admin/interfaces/product.interfaces';
import { Model } from '../enums';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor() {}

  public filterData(data: any[], term: string, dataModel: string): any[] {
    if(dataModel === Model.Product) {
      return data.filter((product: IProduct)  =>
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.group.name.toLowerCase().includes(term.toLowerCase()) ||
        product.unit.toLowerCase().includes(term.toLowerCase())
      );
    }
    return data;
  }
}
