import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Model } from 'src/app/core/enums';
import { SearchService } from 'src/app/core/services';
import { LoadingComponent, NoResultComponent, PrimaryButtonComponent } from 'src/app/shared';
import { IEntry, IHistory, IOutput } from '../../interfaces';
import { HistoryQueries } from '../../services';
import { EMPTY_HISTORY } from 'src/app/core/helpers';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatTableModule } from '@angular/material/table';
import moment from 'moment';

const TABLE_COLUMNS = ['date', 'product', 'unit', 'initialQuantity', 'type', 'quantity', 'finalQuantity', 'document'];

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    LoadingComponent, CommonModule, PrimaryButtonComponent,
    MatInputModule, FormsModule, NgxPaginationModule,
    NoResultComponent, MatTableModule
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  public loading = true;
  public searchInput = '';
  public displayedColumns: string[] = TABLE_COLUMNS;
  public history: IHistory = EMPTY_HISTORY;
  public mergedHistory: any = [];
  public filteredHistory: any = EMPTY_HISTORY;
  public page = 1;
moment: any;

  constructor(
    private searchEngine: SearchService,
    private historyQuery: HistoryQueries
  ){}

  ngOnInit(): void {
    this.historyQuery.getHistory().subscribe((data) => {
      this.history = data;
      this.filteredHistory = data;
      this.mergeHistory();
    });
  }

  public onSearch(term: string): void {
    this.filteredHistory = this.searchEngine.filterData(this.mergedHistory, term, Model.History);
  }

  public goToUrl(link: string): void {
    window.open(link, "_blank");
  }

  public getDate(date: Date): string {
    return moment.utc(date).format('DD/MM/YYYY');
  }

  private mergeHistory(): void {
    this.history.entries.forEach((entry) => {
      entry.productsEntry.forEach(productEntry => {
        this.mergedHistory.push({
          date: entry.date,
          product: productEntry.product.name,
          unit: productEntry.product.unit,
          initialQuantity: productEntry.currentQuantity - productEntry.quantity,
          type: 'Entrada',
          quantity: productEntry.quantity,
          finalQuantity: productEntry.currentQuantity,
          document: entry?.invoiceUrl || ''
        });
      });
    });

    this.history.outputs.forEach(output => {
      this.mergedHistory.push({
        date: output.date,
        product: output.product.name,
        unit: output.product.unit,
        initialQuantity: output.currentQuantity + output.quantity,
        type: "Salida",
        quantity: output.quantity,
        finalQuantity: output.currentQuantity,
        document: output.requisition?.documentUrl || ''
      });
    });

    this.mergedHistory.sort((a: any, b: any) => moment(b.date).diff(moment(a.date)));

    this.filteredHistory = this.mergedHistory;
    this.loading = false;
  }
}
