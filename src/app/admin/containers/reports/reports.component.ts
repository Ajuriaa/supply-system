import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormField } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PDFHelper } from 'src/app/core/helpers';
import { DateFilterComponent, LoadingComponent, PrimaryButtonComponent } from 'src/app/shared';
import moment from 'moment';
import { ReportQueries } from '../../services';

const OPTIONS = [
    { value: 'departments', label: 'Salidas por Departamento', columns: ['Departamento', 'Requisiciones','Costo (L.)'] },
    { value: 'products', label: 'Salidas por Producto', columns: ['Producto', 'Unidad', 'Cantidad', 'Costo (L.)'] },
    { value: 'daily', label: 'Salidas Diarias', columns: ['Producto', 'Cantidad'] },
    { value: 'groups', label: 'Salidas por Grupo', columns: ['Producto', 'Cantidad'] },
    { value: 'entries', label: 'Entradas por Producto', columns: ['Producto', 'Cantidad'] },
    { value: 'providers', label: 'Entradas por Proveedor', columns: ['Producto', 'Cantidad'] },
    { value: 'stock', label: 'Aviso Stock Bajo', columns: ['Producto', 'Cantidad'] }
  ];

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    LoadingComponent, PrimaryButtonComponent, CommonModule,
    MatFormField, MatSelectModule, MatOptionModule,
    FormsModule, DateFilterComponent
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  public loading = false;
  public reports = OPTIONS;
  public error = false;
  public selectedReport = { value: '', label: '', columns: ['']};
  public endDate = new Date();
  public startDate = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), 1);
  public start = moment.utc(this.startDate).format('YYYY-MM-DD');
  public end = moment.utc(this.endDate).format('YYYY-MM-DD');

  constructor(
    private pdfHelper: PDFHelper,
    private reportQuery: ReportQueries
  ){}

  public generateReport(): void {
    if(this.selectedReport.value === '') {
      this.error = true;
      return;
    }
    // Generate report
    this.loading = true;
    this.reportQuery.getReport(this.selectedReport.value, this.start, this.end).subscribe(({ data }) => {
      this.pdfHelper.generatePDF(this.generateData(data.info), this.selectedReport.columns, this.selectedReport.label, true, this.startDate, this.endDate, true, data.total);
      this.loading = false;}
    );
  }

  public selectReport(report: { value: string, label: string, columns: string[] }): void {
    this.selectedReport = report;
  }

  public filterDates(dates: { startDate: Date | null, endDate: Date | null }): void {
    if(dates.startDate && dates.endDate) {
      this.startDate = dates.startDate;
      this.endDate = dates.endDate;
      this.start = moment.utc(this.startDate).format('YYYY-MM-DD');
      this.end = moment.utc(this.endDate).format('YYYY-MM-DD');
    }
  }

  private generateData(objArray: any[]): any {
    if(objArray.length === 0) return [];
    return objArray.map(obj => Object.values(obj));
  }
}
