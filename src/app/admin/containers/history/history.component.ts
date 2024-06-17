import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Model } from 'src/app/core/enums';
import { SearchService } from 'src/app/core/services';
import { LoadingComponent, PrimaryButtonComponent } from 'src/app/shared';
import { IHistory } from '../../interfaces';

const TABLE_COLUMNS = ['date', 'product', 'unit', 'initialQuantity', 'type', 'quantity', 'finalQuantity', 'document'];

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    LoadingComponent, CommonModule, PrimaryButtonComponent,
    MatInputModule, FormsModule
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent {
  public loading = false;
  public searchInput = '';
  public history: IHistory[] = [];
  public filteredHistory: IHistory[] = [];

  constructor(
    private searchEngine: SearchService,
  ){}
  public onSearch(term: string): void {
    this.filteredHistory = this.searchEngine.filterData(this.history, term, Model.History);
  }
}
