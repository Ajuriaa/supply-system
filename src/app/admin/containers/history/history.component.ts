import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Model } from 'src/app/core/enums';
import { SearchService } from 'src/app/core/services';
import { DateFilterComponent, LoadingComponent, NoResultComponent, PrimaryButtonComponent } from 'src/app/shared';
import { EMPTY_HISTORY, PDFHelper } from 'src/app/core/helpers';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatTableModule } from '@angular/material/table';
import moment from 'moment';
import { HistoryQueries } from '../../services';
import { IHistory, IMergedHistory } from '../../interfaces';

const TABLE_COLUMNS = ['date', 'product', 'unit', 'type', 'initialQuantity', 'quantity', 'finalQuantity', 'document'];

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    LoadingComponent, CommonModule, PrimaryButtonComponent,
    MatInputModule, FormsModule, NgxPaginationModule,
    NoResultComponent, MatTableModule, DateFilterComponent
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  public loading = true;
  public searchInput = '';
  public displayedColumns: string[] = TABLE_COLUMNS;
  public history: IHistory = EMPTY_HISTORY;
  public mergedHistory: IMergedHistory[] = [];
  public filteredHistory: IMergedHistory[] = [];
  public page = 1;
  public end = new Date();
  public start = new Date(this.end.getFullYear(), this.end.getMonth(), 1);
  public monthInput = 0;
  public monthOutput = 0;

  constructor(
    private searchEngine: SearchService,
    private historyQuery: HistoryQueries,
    private pdfHelper: PDFHelper
  ){}

  ngOnInit(): void {
    this.historyQuery.getHistory().subscribe((data) => {
      this.history = data;
      this.mergeHistory();
    });
  }

  public onSearch(term: string): void {
    this.filteredHistory = this.searchEngine.filterData(this.mergedHistory, term, Model.History);
  }

  public generatePDF(): void {
    this.pdfHelper.generateHistoryPDF(this.filteredHistory, this.start, this.end);
  }

  public goToUrl(link: string): void {
    window.open(link, "_blank");
  }

  public getDate(date: Date): string {
    return moment.utc(date).format('DD/MM/YYYY');
  }

  public filterDates(dates: { startDate: Date | null, endDate: Date | null }): void {
    if(dates.startDate && dates.endDate) {
      this.start = dates.startDate;
      this.end = dates.endDate;
      this.filteredHistory = this.mergedHistory.filter(
        (history) => {
          const date = moment.utc(history.date);
          return moment(date).isBetween(dates.startDate, dates.endDate, null, '[]');
        }
      );
    } else {
      this.filteredHistory = this.mergedHistory;
    }
    this.page = 1;
  }

  private mergeHistory(): void {
    const month = moment().month();
    this.monthInput = this.history.entries.filter(entry => moment(entry.date).month() === month).length;
    this.monthOutput = this.history.outputs.filter(output => moment(output.date).month() === month).length;

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

    this.filteredHistory = this.mergedHistory.filter(history => moment(history.date).month() === month);
    this.loading = false;
  }
}
