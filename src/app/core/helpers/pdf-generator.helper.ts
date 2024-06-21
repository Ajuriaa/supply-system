import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import { IProduct, IRequisition, ISupplier } from 'src/app/admin/interfaces';

@Injectable({
  providedIn: 'root'
})
export class PDFHelper {
  private isFirstPageDrawn = false;
  constructor() {}

  public generatePDF(formattedData: any[], columns: string[], title: string): void {
    this.isFirstPageDrawn = false;
    const doc = new jsPDF('landscape');
    doc.setTextColor(40);
    const blue = '#88CFE0';

    autoTable(doc, {
      head: [columns],
      body: formattedData,
      margin: { top: 45, right: 10, bottom: 20, left: 20 },
      styles: { halign: 'center', valign: 'middle'},
      headStyles: { fillColor: blue },
      didDrawPage: (data) => {
        doc.setFontSize(20);
        const pageSize = doc.internal.pageSize;

        // Header
        if (!this.isFirstPageDrawn) {
          data.settings.margin.top = 4;
          const centerX = pageSize.width / 2;
          doc.text(title, centerX - (doc.getTextWidth(title) / 2), 25);

          doc.addImage('assets/pdf.jpg', 'JPEG', 20, 5, 40, 40);
          doc.addImage('assets/pdf2.jpg', 'JPEG', pageSize.width-50, 2, 40, 40);
          this.isFirstPageDrawn = true;
        }

        // Left stripe
        const margin = 4;
        doc.setFillColor(blue);
        doc.rect(margin, margin, 10, pageSize.height-2*margin, 'F');
      },
    });
    const pageCount = (doc as any).internal.getNumberOfPages();
    const footerHeight = doc.internal.pageSize.height - 7;

    // Footer
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text('Página ' + i + ' de ' + pageCount, doc.internal.pageSize.width - 35, footerHeight);
      doc.text('Lista generada el ' + moment().format('DD/MM/YYYY'), 25, footerHeight);
    }

    doc.output('dataurlnewwindow');
  }

  public generateSuppliersPDF(suppliers: ISupplier[]): void {
    const columns = ['Nombre', 'Correo', 'Teléfono', 'Dirección', 'RTN', 'Última entrada', '# de Entregas'];
    const formattedSuppliers = this.formatSuppliersForPDF(suppliers);
    this.generatePDF(formattedSuppliers, columns, 'Listado de Proveedores');
  }

  public generateRequisitionsPDF(requisitions: IRequisition[]): void {
    const columns = ['Estado', 'Empleado', 'Jefe', 'Departamento'];
    const formattedSuppliers = this.formatRequisitionsForPDF(requisitions);
    this.generatePDF(formattedSuppliers, columns, 'Listado de Requisiciones');
  }

  public generateProductsPDF(products: IProduct[]): void {
    const columns = ['Nombre', 'Grupo', 'Cantidad', 'Unidad', 'Vencimiento', 'Precio'];
    const formattedVehicles = this.formatProductsForPDF(products);
    this.generatePDF(formattedVehicles, columns, 'Listado de Productos',);
  }

  public generateHistoryPDF(history: any[]): void {
    const columns = ['Fecha', 'Producto', 'Unidad', 'Tipo', 'Cantidad Inicial', 'Cantidad', 'Cantidad Final'];
    const formattedHistory = this.formatHistoryForPDF(history);
    this.generatePDF(formattedHistory, columns, 'Historial de Productos');
  }

  private formatHistoryForPDF(history: any[]) {
    return history.map(entry => {
      return [
        moment.utc(entry.date).format('DD/MM/YYYY'),
        entry.product,
        entry.unit,
        entry.type,
        entry.initialQuantity,
        entry.quantity,
        entry.finalQuantity
      ];
    });
  }

  private formatSuppliersForPDF(suppliers: ISupplier[]) {
    return suppliers.map(supplier => {
      return [
        supplier.name || 'No Registrado',
        supplier.email || 'No Registrado',
        supplier.phone || 'No Registrado',
        supplier.address || 'No Registrado',
        supplier.rtn || 'No Registrado',
        this.getDate(supplier.entries[0].date),
        supplier.entries.length
      ];
    });
  }

  public formatRequisitionsForPDF(requisitions: IRequisition[]) {
    return requisitions.map(requisition => {
      return [
        requisition.state.state,
        requisition.employeeName,
        requisition.bossName,
        requisition.department
      ];
    });
  }

  public formatProductsForPDF(products: IProduct[]) {
    return products.map(product => {
      return [
        product.name,
        product.group.name,
        product.batches?.reduce((acc, batch) => acc + batch.quantity, 0),
        product.unit,
        product.batches.length > 0 ? this.getDate(product.batches[0].due) : 'No Registrado',
        product.batches.length > 0 ? product.batches[0].price : 'No Registrado'
      ];
    });
  }

  private getDate(date: Date): string {
    return moment(date).format('DD/MM/YYYY');
  }
}

