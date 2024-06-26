import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingComponent, PrimaryButtonComponent, NoResultComponent } from 'src/app/shared';
import { Model } from 'src/app/core/enums';
import { PDFHelper } from 'src/app/core/helpers';
import { SearchService } from 'src/app/core/services';
import { MatDialog } from '@angular/material/dialog';
import moment from 'moment';
import { IRequisition } from '../../interfaces';
import { RequisitionQueries } from '../../services';
import { NameHelper } from '../../helpers';
import { CancelRequisitionComponent } from '../../components';

const TABLE_COLUMNS = ['date', 'state', 'employee', 'boss', 'department', 'document', 'actions'];

@Component({
  selector: 'app-requisition',
  standalone: true,
  imports: [
    LoadingComponent, CommonModule, FormsModule,
    PrimaryButtonComponent, NoResultComponent, MatTableModule,
    NgxPaginationModule
  ],
  providers: [PDFHelper, NameHelper],
  templateUrl: './requisitions.component.html',
  styleUrl: './requisitions.component.scss'
})
export class RequisitionComponent implements OnInit {
  public loading = true;
  public searchInput = '';
  public displayedColumns: string[] = TABLE_COLUMNS;
  public requisitions: IRequisition[] = [];
  public filteredRequisitions: IRequisition[] = [];
  public page = 1;
  public monthlyRequisitions = 1;

  constructor(
    private searchEngine: SearchService,
    private pdfHelper: PDFHelper,
    private nameHelper: NameHelper,
    private requisitionQuery: RequisitionQueries,
    private dialog: MatDialog
  ){}

  ngOnInit(): void {
    this.getAllRequisitions();
  }

  public onSearch(term: string): void {
    this.filteredRequisitions = this.searchEngine.filterData(this.requisitions, term, Model.Requisition);
  }

  public goToUrl(link: string): void {
    window.open(link, "_blank");
  }

  public getDate(date: Date): string {
    return moment(date).format('DD/MM/YYYY');
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

  public openCancelRequisitionModal(requisition: IRequisition): void {
    this.dialog.open(CancelRequisitionComponent, {
      panelClass: 'dialog-style',
      data: requisition
    }).afterClosed().subscribe((result) => {
      if(result) {
        this.getAllRequisitions();
      }
    });
  }

  public canCancel(state: string): boolean {
    return state === 'Pendiente por admin';
  }

  private getAllRequisitions(): void {
    this.requisitionQuery.getAllProducts().subscribe((response) => {
      this.requisitions = response.data;
      this.filteredRequisitions = this.requisitions;
      this.getMonthlyRequisitions();
      this.loading = false;
    });
  }

  private getMonthlyRequisitions(): void {
    const currentMonth = moment().month();
    this.monthlyRequisitions = this.requisitions.filter((requisition) => {
      return moment(requisition.systemDate).month() === currentMonth;
    }).length;
  }
}
