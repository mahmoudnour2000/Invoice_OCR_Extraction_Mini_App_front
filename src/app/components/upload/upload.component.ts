import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFile: File | null = null;
  isDragOver = false;
  isUploading = false;
  isSaving = false;
  uploadProgress = 0;
  errorMessage = '';
  successMessage = '';
  extractedInvoice: any = null;

  constructor(
    private invoiceService: InvoiceService,
    private router: Router
  ) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFileSelection(file);
    }
  }

  private handleFileSelection(file: File) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Please select a valid file type (PDF, JPG, PNG)';
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      this.errorMessage = 'File size must be less than 10MB';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';
    this.extractedInvoice = null;
  }

  removeFile() {
    this.selectedFile = null;
    this.errorMessage = '';
    this.extractedInvoice = null;
  }

  uploadFile() {
    console.log('uploadFile called, selectedFile:', this.selectedFile);
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;
    this.errorMessage = '';

    const progressInterval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 90) {
        clearInterval(progressInterval);
      }
    }, 200);

    this.invoiceService.uploadInvoice(this.selectedFile).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        this.isUploading = false;

        // استخدم invoiceId مباشرة إذا كان موجودًا
        const invoiceId = (response as any).invoiceId;
        if (invoiceId) {
          console.log('Upload response (invoiceId):', response);
          this.invoiceService.getInvoiceById(invoiceId).subscribe({
            next: (invoiceResp) => {
              console.log('Get invoice by id response:', invoiceResp);
              // إذا كانت الاستجابة تحتوي على data استخدمها، وإلا استخدم الاستجابة نفسها
              const invoiceData = (invoiceResp && (invoiceResp as any).data) ? (invoiceResp as any).data : invoiceResp;
              if (invoiceData && invoiceData.id) {
                this.extractedInvoice = { ...invoiceData };
                if (this.extractedInvoice && (this.extractedInvoice as any).invoiceDate) {
                  this.extractedInvoice.date = (this.extractedInvoice as any).invoiceDate.split('T')[0];
                }
              } else {
                this.errorMessage = (invoiceResp && (invoiceResp as any).message) || 'Failed to fetch invoice data';
                console.error('Invoice fetch error:', invoiceResp);
              }
            },
            error: (err) => {
              this.errorMessage = err.message || 'Failed to fetch invoice data';
              console.error('Invoice fetch error:', err);
            }
          });
        } else {
          this.errorMessage = response.message || 'Upload failed';
          console.error('Upload error:', response);
        }
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.uploadProgress = 0;
        this.isUploading = false;
        this.errorMessage = error.message || 'Upload failed. Please try again.';
        console.error('Upload error:', error);
      }
    });
  }

  calculateTotal() {
    if (this.extractedInvoice) {
      this.extractedInvoice.totalAmount = 
        (this.extractedInvoice.subtotal || 0) + (this.extractedInvoice.vatAmount || 0);
    }
  }

  saveInvoice() {
    console.log('saveInvoice called, extractedInvoice:', this.extractedInvoice);
    if (!this.extractedInvoice) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Use createInvoice if no ID, updateInvoice if has ID
    const saveObservable = this.extractedInvoice.id 
      ? this.invoiceService.updateInvoice(this.extractedInvoice)
      : this.invoiceService.createInvoice(this.extractedInvoice);

    saveObservable.subscribe({
      next: (response) => {
        console.log('Save invoice response:', response); // طباعة استجابة الحفظ
        this.isSaving = false;
        // @ts-ignore: قد تحتوي الاستجابة على status فقط في بعض الحالات
        if ((response && response.success && response.data) || (response && (response as any).status === 200) || (response && Object.keys(response).length === 0)) {
          this.successMessage = 'تم حفظ الفاتورة بنجاح!';
          // إخفاء الفورم تلقائياً
          setTimeout(() => {
            this.successMessage = '';
            this.extractedInvoice = null;
            this.router.navigate(['/invoices']);
          }, 2000);
        } else {
          this.successMessage = 'تم حفظ الفاتورة بنجاح!'; // fallback إذا لم يكن هناك خطأ
          setTimeout(() => {
            this.successMessage = '';
            this.extractedInvoice = null;
            this.router.navigate(['/invoices']);
          }, 2000);
          if (response && response.message) {
            this.errorMessage = response.message;
            this.successMessage = '';
            console.error('Save invoice error:', response);
          }
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = error.message || 'Failed to save invoice';
        console.error('Save invoice error:', error);
      }
    });
  }

  resetUpload() {
    this.selectedFile = null;
    this.extractedInvoice = null;
    this.errorMessage = '';
    this.uploadProgress = 0;
    this.isUploading = false;
    this.isSaving = false;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
