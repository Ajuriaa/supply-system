import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FileDropComponent, LoadingComponent, PrimaryButtonComponent } from 'src/app/shared';
import { environment } from 'src/environments/environments';
import { Upload } from 'src/app/core/enums/upload-types.enum';
import { EntryMutations, UploaderService } from '../../services';
import { FileNameHelper } from '../../helpers';

@Component({
  selector: 'app-edit-invoice-dialog',
  standalone: true,
  imports: [
    LoadingComponent, CommonModule, PrimaryButtonComponent,
    FileDropComponent, MatFormFieldModule, FormsModule,
    ReactiveFormsModule, MatInputModule
  ],
  providers: [EntryMutations, UploaderService, FileNameHelper],
  templateUrl: './edit-invoice-dialog.component.html',
  styleUrl: './edit-invoice-dialog.component.scss'
})
export class EditInvoiceDialogComponent implements OnInit {
  public loading = false;
  public error = false;
  public notFound = false;
  public entryFound = false;
  public searchForm!: FormGroup;
  public editForm!: FormGroup;
  public selectedFile!: File;
  public currentEntry: any = null;
  public fileUrl = environment.filesUrl;
  public showFileUpload = false;

  constructor(
    private _formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<EditInvoiceDialogComponent>,
    private entryMutations: EntryMutations,
    private uploaderService: UploaderService,
    private fileNameHelper: FileNameHelper
  ) {}

  ngOnInit(): void {
    this.searchForm = this._formBuilder.group({
      invoiceNumber: ['', [Validators.required]]
    });

    this.editForm = this._formBuilder.group({
      newInvoiceNumber: ['', [Validators.required]],
      replaceFile: [false]
    });
  }

  public onCancel(changesMade = false): void {
    this.dialogRef.close(changesMade);
  }

  public async searchEntry(): Promise<void> {
    this.error = false;
    this.notFound = false;
    this.entryFound = false;

    if (this.searchForm.invalid) {
      this.error = true;
      return;
    }

    this.loading = true;
    const invoiceNumber = this.searchForm.value.invoiceNumber;

    try {
      const entry = await this.entryMutations.getEntryByInvoiceNumber(invoiceNumber);

      if (entry) {
        this.currentEntry = entry;
        this.entryFound = true;
        this.editForm.patchValue({
          newInvoiceNumber: entry.invoiceNumber
        });
      } else {
        this.notFound = true;
      }
    } catch (error) {
      this.notFound = true;
    }

    this.loading = false;
  }

  public toggleFileUpload(): void {
    this.showFileUpload = !this.showFileUpload;
  }

  public getFiles(files: File[]): void {
    this.selectedFile = files[0];
  }

  public async onSubmit(): Promise<void> {
    this.error = false;

    if (this.editForm.invalid) {
      this.error = true;
      return;
    }

    this.loading = true;

    let newInvoiceUrl: string | undefined;
    let fileUploaded = true;

    // Handle file upload if a new file was selected
    if (this.selectedFile) {
      const fileName = this.fileNameHelper.getFileName(Upload.invoice, this.selectedFile);
      const realName = this.fileNameHelper.getRealFileName(fileName);
      newInvoiceUrl = this.fileUrl + 'invoices/' + realName;
      fileUploaded = await this.uploaderService.uploadFile(this.selectedFile, fileName);
    }

    if (fileUploaded) {
      const originalInvoiceNumber = this.searchForm.value.invoiceNumber;
      const newInvoiceNumber = this.editForm.value.newInvoiceNumber !== originalInvoiceNumber
        ? this.editForm.value.newInvoiceNumber
        : undefined;

      try {
        const response = await this.entryMutations.updateEntryInvoice(
          originalInvoiceNumber,
          newInvoiceNumber,
          newInvoiceUrl
        );

        if (response.success) {
          this.onCancel(true);
        } else {
          this.loading = false;
        }
      } catch (error) {
        this.loading = false;
      }
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  public hasCurrentInvoice(): boolean {
    return this.currentEntry && this.currentEntry.invoiceUrl;
  }

  public getCurrentInvoiceUrl(): string {
    return this.currentEntry?.invoiceUrl || '';
  }

  public getInvoiceFileName(): string {
    if (!this.hasCurrentInvoice()) return '';
    const url = this.getCurrentInvoiceUrl();
    return url.split('/').pop() || '';
  }
}
