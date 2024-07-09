import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environments';
import { IProductRequisition } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class RequisitionMutations {
  constructor(
    private http: HttpClient,
    private toaster: ToastrService
  ) {}

  public cancelRequisiton(id: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.http.post<boolean>(`${environment.apiUrl}/cancel-requisition`, { id }).subscribe(
        (response: boolean) => {
          if (response) {
            this.toaster.success('Requisición cancelada correctamente', 'Listo!');
            resolve(response);
          } else {
            this.toaster.success('Ocurrió un error', 'Error!');
            resolve(response);
          }
        },
        (error) => {
          this.toaster.error(error.message, 'Error!');
          reject(error);
        }
      );
    });
  }

  public finishRequisiton(id: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.http.post<boolean>(`${environment.apiUrl}/finish-requisition`, { id }).subscribe(
        (response: boolean) => {
          if (response) {
            this.toaster.success('Requisición finalizada correctamente', 'Listo!');
            resolve(response);
          } else {
            this.toaster.success('Ocurrió un error', 'Error!');
            resolve(response);
          }
        },
        (error) => {
          this.toaster.error(error.message, 'Error!');
          reject(error);
        }
      );
    });
  }

  public updateRequisition(productsRequisition: Partial<IProductRequisition>[]): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.http.post<boolean>(`${environment.apiUrl}/update-requisition`, productsRequisition).subscribe(
        (response: boolean) => {
          if (response) {
            this.toaster.success('Requisición actualizada correctamente', 'Listo!');
            resolve(response);
          } else {
            this.toaster.success('Ocurrió un error', 'Error!');
            resolve(response);
          }
        },
        (error) => {
          this.toaster.error(error.message, 'Error!');
          reject(error);
        }
      );
    });
  }
}
