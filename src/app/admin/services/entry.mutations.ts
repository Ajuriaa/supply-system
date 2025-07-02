import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { cookieHelper } from 'src/app/core/helpers';
import { environment } from 'src/environments/environments';
import { IBatchWithIds, IProductEntryWithIds } from '../components/confirm-input/confirm-input.component';
import { ICreateEntry } from '../containers';

@Injectable({
  providedIn: 'root'
})
export class EntryMutations {
  constructor(
    private http: HttpClient,
    private toaster: ToastrService,
    private cookieHelper: cookieHelper
  ) {}

  public createEntries(entry: ICreateEntry, products: IProductEntryWithIds[], batches: IBatchWithIds[]): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.http.post<boolean>(`${environment.apiUrl}/create-entries`, { entry, products, batches }).subscribe(
        (response: boolean) => {
          if (response) {
            this.toaster.success('Entradas creadas correctamente', 'Listo!');
            resolve(response);
          } else {
            this.toaster.success('Ocurrió un error durante la creación', 'Error!');
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

  public getEntryByInvoiceNumber(invoiceNumber: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.http.get<any>(`${environment.apiUrl}/entry-by-invoice/${invoiceNumber}`).subscribe(
        (response: any) => {
          resolve(response);
        },
        (error) => {
          this.toaster.error('Error al buscar la factura', 'Error!');
          reject(error);
        }
      );
    });
  }

  public updateEntryInvoice(originalInvoiceNumber: string, newInvoiceNumber?: string, newInvoiceUrl?: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const data = this.cookieHelper.dataToSend({
        originalInvoiceNumber,
        newInvoiceNumber,
        newInvoiceUrl
      });
      
      this.http.post<any>(`${environment.apiUrl}/update-entry-invoice`, data).subscribe(
        (response: any) => {
          if (response.success) {
            this.toaster.success('Factura actualizada correctamente', 'Listo!');
            resolve(response);
          } else {
            this.toaster.error(response.message || 'Error al actualizar la factura', 'Error!');
            resolve(response);
          }
        },
        (error) => {
          this.toaster.error(error.message || 'Error interno del servidor', 'Error!');
          reject(error);
        }
      );
    });
  }
}
