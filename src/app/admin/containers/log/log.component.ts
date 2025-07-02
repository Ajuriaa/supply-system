import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Model } from 'src/app/core/enums';
import { SearchService } from 'src/app/core/services';
import { DateFilterComponent, LoadingComponent, NoResultComponent, PrimaryButtonComponent } from 'src/app/shared';
import { PDFHelper } from 'src/app/core/helpers';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatTableModule } from '@angular/material/table';
import moment from 'moment';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { EntryQueries } from '../../services';

const TABLE_COLUMNS = ['date', 'invoiceNumber', 'supplier', 'user', 'fieldChanged', 'oldValue', 'newValue', 'notes'];

export interface IEntryEditLog {
  id: number;
  entryId: number;
  systemUser: string;
  systemDate: Date;
  fieldChanged: string;
  oldValue: string | null;
  newValue: string | null;
  notes: string | null;
  entry: {
    invoiceNumber: string;
    supplier: {
      name: string;
    };
  };
}

@Component({
  selector: 'app-log',
  standalone: true,
  imports: [
    LoadingComponent, CommonModule, PrimaryButtonComponent,
    MatInputModule, FormsModule, NgxPaginationModule,
    NoResultComponent, MatTableModule, DateFilterComponent,
    MatSelectModule, MatOptionModule
  ],
  templateUrl: './log.component.html',
  styleUrl: './log.component.scss'
})
export class LogComponent implements OnInit {
  public loading = true;
  public searchInput = '';
  public displayedColumns: string[] = TABLE_COLUMNS;
  public entryLogs: IEntryEditLog[] = [];
  public filteredLogs: IEntryEditLog[] = [];
  public page = 1;
  public end = new Date();
  public start = new Date(this.end.getFullYear(), this.end.getMonth(), 1);
  public totalLogs = 0;
  public monthLogs = 0;

  constructor(
    private searchEngine: SearchService,
    private entryQuery: EntryQueries,
    private pdfHelper: PDFHelper
  ){}

  ngOnInit(): void {
    this.entryQuery.getEntryLogs().subscribe((data) => {
      this.entryLogs = data;
      this.calculateStats();
      this.filteredLogs = [...this.entryLogs];
      this.loading = false;
    });
  }

  public onSearch(term: string): void {
    this.filteredLogs = this.searchEngine.filterData(this.entryLogs, term, Model.History);
  }

  public generatePDF(): void {
    this.pdfHelper.generateHistoryPDF(this.filteredLogs, this.start, this.end);
  }

  public filter(fieldType: string): void {
    this.filteredLogs = this.entryLogs.filter((log) => log.fieldChanged === fieldType);
    this.page = 1;
  }

  public getDate(date: Date): string {
    return moment.utc(date).format('DD/MM/YYYY HH:mm');
  }

  public getFieldName(fieldChanged: string): string {
    const fieldNames: { [key: string]: string } = {
      'Numero_Factura': 'Número de Factura',
      'URL_Factura': 'URL de Factura'
    };
    return fieldNames[fieldChanged] || fieldChanged;
  }

  public getFileName(url: string): string {
    if (!url) return 'N/A';
    return url.split('/').pop() || url;
  }

  public openFile(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  public filterDates(dates: { startDate: Date | null, endDate: Date | null }): void {
    if(dates.startDate && dates.endDate) {
      this.start = dates.startDate;
      this.end = dates.endDate;
      this.filteredLogs = this.entryLogs.filter(
        (log) => {
          const date = moment.utc(log.systemDate);
          return moment.utc(date).isBetween(dates.startDate, dates.endDate, null, '[]');
        }
      );
    } else {
      this.filteredLogs = [...this.entryLogs];
    }
    this.page = 1;
  }

  private calculateStats(): void {
    const currentMonth = moment.utc().month();
    this.totalLogs = this.entryLogs.length;
    this.monthLogs = this.entryLogs.filter(log => 
      moment.utc(log.systemDate).month() === currentMonth
    ).length;
  }
}