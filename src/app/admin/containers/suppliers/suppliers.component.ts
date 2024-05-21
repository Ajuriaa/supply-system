import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { NgxPaginationModule } from 'ngx-pagination';
import { PDFHelper } from 'src/app/core/helpers';
import { SearchService } from 'src/app/core/services';
import { LoadingComponent, PrimaryButtonComponent, NoResultComponent } from 'src/app/shared';
import { Model } from 'src/app/core/enums';
import moment from 'moment';
import { SuppliersQueries } from '../../services';
import { ISupplier } from '../../interfaces';

const TABLE_COLUMNS = ['name', 'email', 'phone', 'address', 'rtn', 'latestEntry', 'amount', 'actions'];

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [
    LoadingComponent, CommonModule, FormsModule,
    PrimaryButtonComponent, NoResultComponent, MatTableModule,
    NgxPaginationModule
  ],
  templateUrl: './suppliers.component.html'
})
export class SuppliersComponent implements OnInit {
  public loading = true;
  public searchInput = '';
  public displayedColumns: string[] = TABLE_COLUMNS;
  public suppliers: ISupplier[] = [];
  public filteredSuppliers: ISupplier[] = [];
  public page = 1;

  constructor(
    private searchEngine: SearchService,
    private pdfHelper: PDFHelper,
    private supplierQuery: SuppliersQueries
  ){}

  ngOnInit(): void {
    this.getAllSuppliers();
  }

  public onSearch(term: string): void {
    this.filteredSuppliers = this.searchEngine.filterData(this.suppliers, term, Model.Supplier);
  }

  public generatePDF(): void {
    this.pdfHelper.generateSuppliersPDF(this.filteredSuppliers);
  }

  public getAmount(supplier: ISupplier): number {
    return supplier.entries.length;
  }

  public getLatestEntry(supplier: ISupplier): string {
    return moment.utc(supplier.entries[0].date).format('DD/MM/YYYY');
  }

  private getAllSuppliers(): void {
    this.supplierQuery.getAllSuppliers().subscribe(({ data }) => {
      this.suppliers = data;
      this.filteredSuppliers = data;
      this.loading = false;
    });
  }
}
