import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormField } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PDFHelper } from 'src/app/core/helpers';
import { DateFilterComponent, LoadingComponent, PrimaryButtonComponent } from 'src/app/shared';

const OPTIONS = [
  'Salidas por Departamento', 'Salidas por Producto', 'Salidas Diarias',
  'Salidas por Grupo', 'Entradas por Producto', 'Entradas por Proveedor',
  'Aviso Stock Bajo'
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
  public reports: string[] = OPTIONS;
  public error = false;
  public selectedReport = '';
  public start = new Date();
  public end = new Date();

  constructor(
    private pdfHelper: PDFHelper
  ){}

  public generateReport(): void {
    if(this.selectedReport === '') {
      this.error = true;
      return;
    }
    // Generate report
  }

  public filterDates(dates: { startDate: Date | null, endDate: Date | null }): void {
    if(dates.startDate && dates.endDate) {
      this.start = dates.startDate;
      this.end = dates.endDate;
    }
  }
}
