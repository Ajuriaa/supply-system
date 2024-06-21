import { Component, Input, OnInit } from '@angular/core';
import moment from 'moment';
import { IProduct } from 'src/app/admin/interfaces';
import { EMPTY_PRODUCT } from 'src/app/core/helpers';

@Component({
  selector: 'app-notification-card',
  standalone: true,
  imports: [],
  templateUrl: './notification-card.component.html',
  styleUrl: './notification-card.component.scss'
})
export class NotificationCardComponent implements OnInit {
  @Input() public product: IProduct = EMPTY_PRODUCT;
  public daysLeft = 0;
  public stock = 0;
  public date = '';

  ngOnInit(): void {
    this.date = moment.utc(this.product.batches[0].due).format('DD/MM/YYYY');
    this.daysLeft = moment.utc(this.product.batches[0].due).diff(moment(), 'days') + 1;
    this.stock = this.product.batches.reduce((acc, batch) => acc + batch.quantity, 0);
  }
}
