import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IGroup, IProduct } from '../../interfaces';
import { FileDropComponent, LoadingComponent, PrimaryButtonComponent } from 'src/app/shared';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProductMutations, ProductQueries, UploaderService } from '../../services';
import { MatSelectModule } from '@angular/material/select';
import { FileNameHelper } from '../../helpers';
import { Upload } from 'src/app/core/enums';
import { environment } from 'src/environments/environments';

@Component({
  selector: 'app-create-update-product',
  standalone: true,
  imports: [
    LoadingComponent, CommonModule, PrimaryButtonComponent,
    FileDropComponent, MatFormFieldModule, FormsModule,
    ReactiveFormsModule, MatInputModule, MatSelectModule
  ],
  providers: [ProductMutations, ProductQueries, FileNameHelper, UploaderService],
  templateUrl: './create-update-product.component.html',
  styleUrl: './create-update-product.component.scss'
})
export class CreateUpdateProductComponent implements OnInit {
  public isCreate = false;
  public loading = true;
  public error = false;
  public fileError = false;
  public groups: IGroup[] = [];
  public productForm!: FormGroup;
  public fileUrl = environment.filesUrl;
  public selectedFile!: File;

  constructor(
    private _formBuilder: FormBuilder,
    private productMutation: ProductMutations,
    private productQuery: ProductQueries,
    private dialogRef: MatDialogRef<CreateUpdateProductComponent>,
    private fileNameHelper: FileNameHelper,
    private uploaderService: UploaderService,
    @Inject(MAT_DIALOG_DATA) public data: { product: IProduct, modalType: string }
  ){}

  ngOnInit(): void {
    this.isCreate = this.data.modalType === 'create';
    this.productForm = this._formBuilder.group({
      name: ['', [Validators.required]],
      minimum: [1, [Validators.required]],
      unit: ['', [Validators.required]],
      group: ['', [Validators.required]]
    });

    this.getGroups();
    this.fillForm();
  }

  public onCancel(changesMade = false): void {
    this.dialogRef.close(changesMade);
  }

  public async onSubmit(): Promise<void> {
    this.error = false;
    this.fileError = false;

    if (this.productForm.invalid) {
      this.error = true;
      return;
    } else if (!this.selectedFile && this.isCreate) {
      this.fileError = true;
      return;
    }
    this.loading = true;

    let file = this.data.product.imageUrl;
    let fileUploaded = true;

    if(this.selectedFile){
      const fileName = this.fileNameHelper.getFileName(Upload.product, this.selectedFile);
      const realName = this.fileNameHelper.getRealFileName(fileName);
      file = this.fileUrl + 'products/' + realName;
      fileUploaded = await this.uploaderService.uploadFile(this.selectedFile, fileName);
    }

    const data: any = {
      id: this.data.product.id,
      name: this.productForm.value.name,
      minimum: this.productForm.value.minimum,
      unit: this.productForm.value.unit,
      groupId: this.groups.find((group) => group.name === this.productForm.value.group)?.id || this.groups[0].id,
      imageUrl: file
    }

    if(fileUploaded){
      const mutationResponse = this.isCreate
      ? await this.productMutation.createProduct(data)
      : await this.productMutation.updateProduct(data);

      if (mutationResponse) {
        this.onCancel(true);
      }
      this.loading = false;
    }
  }

  public getFiles(files: File[]): void {
    this.selectedFile = files[0];
  }

  private fillForm(): void {
    if(this.isCreate) {
      this.loading = false;
      return;
    }

    this.productForm.patchValue({
      name: this.data.product.name,
      minimum: this.data.product.minimum,
      unit: this.data.product.unit,
      group: this.data.product.group.name
    });
    this.loading = false;
  }

  private async getGroups(): Promise<void> {
    this.productQuery.getGroups().subscribe(({ data }) => {
      this.groups = data;
    });
  }
}
