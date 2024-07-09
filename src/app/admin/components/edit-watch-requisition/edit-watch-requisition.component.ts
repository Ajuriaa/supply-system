import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { LoadingComponent, PrimaryButtonComponent } from 'src/app/shared';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { IProduct, IProductRequisition, IRequisition } from '../../interfaces';
import { RequisitionMutations } from '../../services';

@Component({
  selector: 'app-edit-watch-requisition',
  standalone: true,
  imports: [
    LoadingComponent, PrimaryButtonComponent, CommonModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    FormsModule
  ],
  templateUrl: './edit-watch-requisition.component.html',
  styleUrl: './edit-watch-requisition.component.scss'
})
export class EditWatchRequisitionComponent implements OnInit {
  public disabled = false;
  public error = false;
  public loading = false;
  public productsRequisition: IProductRequisition[] = [];

  constructor(
    private dialogRef: MatDialogRef<EditWatchRequisitionComponent>,
    private requisitionMutation: RequisitionMutations,
    @Inject(MAT_DIALOG_DATA) public data: { requisition: IRequisition, type: string }
  ) {}

  ngOnInit(): void {
    this.disabled = this.data.type === 'watch';
    this.productsRequisition = this.data.requisition.productsRequisition;
  }

  public onCancel(changesMade = false): void {
    this.dialogRef.close(changesMade);
  }

  public maxQuantity(product: IProduct): number {
    return product.batches.reduce((acc, batch) => acc + batch.quantity, 0) || 0;
  }

  public async onSubmit(): Promise<void> {
    this.error = false;
    if(this.hasErrors()) {
      this.error = true;
      return;
    }
    this.loading = true;

    const mutationResponse = await this.requisitionMutation.updateRequisition(this.productsRequisition);
    this.onCancel(mutationResponse);
  }

  private hasErrors(): boolean {
    const error = this.data.requisition.productsRequisition.some(req => {
      return req.quantity > this.maxQuantity(req.product);
    });
    return error;
  }
}
