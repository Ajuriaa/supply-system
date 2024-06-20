import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { NgxPaginationModule } from 'ngx-pagination';
import { EMPTY_SUPPLIER, PDFHelper } from 'src/app/core/helpers';
import { SearchService } from 'src/app/core/services';
import { LoadingComponent, PrimaryButtonComponent, NoResultComponent } from 'src/app/shared';
import { Model } from 'src/app/core/enums';
import moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { SuppliersQueries } from '../../services';
import { ISupplier } from '../../interfaces';
import { CreateUpdateSupplierComponent } from '../../components';

const TABLE_COLUMNS = ['name', 'email', 'phone', 'address', 'rtn', 'latestEntry', 'amount', 'actions'];

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [
    LoadingComponent, CommonModule, FormsModule,
    PrimaryButtonComponent, NoResultComponent, MatTableModule,
    NgxPaginationModule
  ],
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
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
    private supplierQuery: SuppliersQueries,
    private dialog: MatDialog
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
    const date = supplier.entries.length > 0 ? moment.utc(supplier.entries[0].date).format('DD/MM/YYYY') : 'Sin entregas';
    return date;
  }

  public openCreateUpdateProductModal(modalType: string = 'create', supplier: ISupplier = EMPTY_SUPPLIER): void {
    this.dialog.open(CreateUpdateSupplierComponent, {
      panelClass: 'dialog-style',
      data: { supplier, modalType }
    }).afterClosed().subscribe((result) => {
      if(result) {
        this.getAllSuppliers();
      }
    });
  }

  private getAllSuppliers(): void {
    this.supplierQuery.getAllSuppliers().subscribe(({ data }) => {
      this.suppliers = data;
      this.filteredSuppliers = data;
      this.loading = false;
    });
  }
}
