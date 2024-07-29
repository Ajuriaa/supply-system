import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoadingComponent, SideBarComponent } from 'src/app/shared';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto'
import { DashboardQueries } from '../../services';
import { IYearlyStats } from '../../interfaces';

const MONTH_OPTIONS = {
  maintainAspectRatio: false,
  responsive: true,
  plugins:{
    title: {
      display: true,
      text: 'SALIDAS MENSUALES',
      font: { size: 20 }
    },
    legend: { display: false },
  }
}

const COLORS = [
  "#E57373",
  "#F06292",
  "#BA68C8",
  "#9575CD",
  "#7986CB",
  "#64B5F6",
  "#4DB6AC",
  "#81C784",
  "#AED581",
  "#FFB74D",
  "#FF8A65",
  "#A1887F"
];


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ SideBarComponent, LoadingComponent, CommonModule ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  public loading = true;
  public yearlyStats: IYearlyStats[] = [];
  public totalRevenue = 0;
  public topEarningMonth: IYearlyStats = { month: '', revenue: 0 };

  constructor(
    private dashboardQuery: DashboardQueries
  ) {}

  ngOnInit(): void {
    this.dashboardQuery.getYearlyStats().subscribe(({ data }) => {
      this.yearlyStats = data;
      this.totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);
      this.topEarningMonth = data.reduce((acc, curr) => acc.revenue > curr.revenue ? acc : curr, { month: '', revenue: 0 });
      this.loading = false;
      this.createYearlyChart()
    });
  }

  private createYearlyChart() {
    const chartElem = <HTMLCanvasElement>document.getElementById(`months`);
    new Chart(
      chartElem, {
        type: 'bar',
        data: {
          labels: this.yearlyStats.map(stat => stat.month),
          datasets: [{
            label: 'Costo',
            data: this.yearlyStats.map(stat => stat.revenue),
            backgroundColor: COLORS
          }]
        },
        options: MONTH_OPTIONS
      }
    )
  }
}
