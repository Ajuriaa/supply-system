import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingComponent, PrimaryButtonComponent, NoResultComponent } from 'src/app/shared';
import { Model } from 'src/app/core/enums';
import { PDFHelper } from 'src/app/core/helpers';
import { SearchService } from 'src/app/core/services';
import { IRequisition } from '../../interfaces';
import { RequisitionQueries } from '../../services/requisitions.queries';
import { NameHelper } from '../../helpers';

const TABLE_COLUMNS = ['state', 'employee', 'boss', 'department', 'document', 'actions'];

@Component({
  selector: 'app-requisition',
  standalone: true,
  imports: [
    LoadingComponent, CommonModule, FormsModule,
    PrimaryButtonComponent, NoResultComponent, MatTableModule,
    NgxPaginationModule
  ],
  providers: [PDFHelper, NameHelper],
  templateUrl: './requisition.component.html',
  styleUrl: './requisition.component.scss'
})
export class RequisitionComponent implements OnInit {
  public loading = true;
  public searchInput = '';
  public displayedColumns: string[] = TABLE_COLUMNS;
  public requisitions: IRequisition[] = [];
  public filteredRequisitions: IRequisition[] = [];
  public page = 1;

  constructor(
    private searchEngine: SearchService,
    private pdfHelper: PDFHelper,
    private nameHelper: NameHelper,
    private requisitionQuery: RequisitionQueries
  ){}

  ngOnInit(): void {
    this.getAllRequisitions();
  }

  public onSearch(term: string): void {
    this.filteredRequisitions = this.searchEngine.filterData(this.requisitions, term, Model.Requisition);
  }

  public generatePDF(): void {
    this.pdfHelper.generateRequisitionsPDF(this.filteredRequisitions);
  }

  public getName(fullName: string): string {
    return this.nameHelper.getShortName(fullName);
  }

  public getDepartment(department: string): string {
    return this.nameHelper.capitalizeWords(department);
  }

  private getAllRequisitions(): void {
    this.requisitionQuery.getAllProducts().subscribe((response) => {
      this.requisitions = response.data;
      this.filteredRequisitions = this.requisitions;
      this.loading = false;
    });
  }
}
