import { Component } from '@angular/core';
import { LoadingComponent, SideBarComponent } from 'src/app/shared';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ SideBarComponent, LoadingComponent, CommonModule ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  public loading = false;
}
