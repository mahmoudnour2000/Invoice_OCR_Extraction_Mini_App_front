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
  template: `
    <div class="upload-container">
      <div class="upload-card">
        <h2>Upload Invoice</h2>
        <p class="subtitle">Upload PDF, JPG, or PNG files for OCR processing</p>
        
        <!-- Upload Area - Hide when data is extracted -->
        <div *ngIf="!extractedInvoice" class="upload-area" 
             [class.dragover]="isDragOver"
             (dragover)="onDragOver($event)"
             (dragleave)="onDragLeave($event)"
             (drop)="onDrop($event)"
             (click)="fileInput.click()">
          <div class="upload-content">
            <div class="upload-icon">📄</div>
            <p>Drag and drop your invoice here or click to browse</p>
            <p class="file-types">Supported: PDF, JPG, PNG</p>
          </div>
          <input #fileInput 
                 type="file" 
                 accept=".pdf,.jpg,.jpeg,.png"
                 (change)="onFileSelected($event)"
                 style="display: none;">
        </div>

        <div *ngIf="selectedFile && !extractedInvoice" class="selected-file">
          <h3>Selected File:</h3>
          <div class="file-info">
            <span class="file-name">{{ selectedFile.name }}</span>
            <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
            <button class="remove-btn" (click)="removeFile()">✕</button>
          </div>
        </div>

        <button *ngIf="selectedFile && !extractedInvoice" 
                class="upload-btn" 
                [disabled]="!selectedFile || isUploading"
                (click)="uploadFile()">
          <span *ngIf="!isUploading">Upload & Process</span>
          <span *ngIf="isUploading">Processing...</span>
        </button>

        <div *ngIf="uploadProgress > 0 && !extractedInvoice" class="progress-bar">
          <div class="progress-fill" [style.width.%]="uploadProgress"></div>
        </div>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
          <button *ngIf="extractedInvoice" class="btn-secondary" (click)="resetUpload()">
            Upload Another File
          </button>
        </div>

        <!-- Editable Form for Extracted Data -->
        <div *ngIf="extractedInvoice" class="extracted-form">
          <div class="form-header">
            <h3>Review & Edit Extracted Data</h3>
            <button class="btn-secondary" (click)="resetUpload()">Upload Another File</button>
          </div>
          
          <form class="invoice-form" #invoiceForm="ngForm">
            <div class="form-section">
              <h4>Invoice Information</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label for="invoiceNumber">Invoice Number *</label>
                  <input type="text" 
                         id="invoiceNumber" 
                         name="invoiceNumber"
                         [(ngModel)]="extractedInvoice.invoiceNumber" 
                         required
                         class="form-control">
                </div>
                <div class="form-group">
                  <label for="date">Date *</label>
                  <input type="date" 
                         id="date" 
                         name="date"
                         [(ngModel)]="extractedInvoice.date" 
                         required
                         class="form-control">
                </div>
              </div>
            </div>

            <div class="form-section">
              <h4>Vendor Information</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label for="vendorName">Vendor Name *</label>
                  <input type="text" 
                         id="vendorName" 
                         name="vendorName"
                         [(ngModel)]="extractedInvoice.vendorName" 
                         required
                         class="form-control">
                </div>
                <div class="form-group full-width">
                  <label for="vendorAddress">Vendor Address</label>
                  <textarea id="vendorAddress" 
                            name="vendorAddress"
                            [(ngModel)]="extractedInvoice.vendorAddress" 
                            rows="2"
                            class="form-control"></textarea>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h4>Customer Information</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label for="customerName">Customer Name *</label>
                  <input type="text" 
                         id="customerName" 
                         name="customerName"
                         [(ngModel)]="extractedInvoice.customerName" 
                         required
                         class="form-control">
                </div>
                <div class="form-group full-width">
                  <label for="customerAddress">Customer Address</label>
                  <textarea id="customerAddress" 
                            name="customerAddress"
                            [(ngModel)]="extractedInvoice.customerAddress" 
                            rows="2"
                            class="form-control"></textarea>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h4>Amount Information</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label for="subtotal">Subtotal</label>
                  <input type="number" 
                         id="subtotal" 
                         name="subtotal"
                         [(ngModel)]="extractedInvoice.subtotal" 
                         step="0.01"
                         min="0"
                         (input)="calculateTotal()"
                         class="form-control">
                </div>
                <div class="form-group">
                  <label for="vatAmount">VAT Amount</label>
                  <input type="number" 
                         id="vatAmount" 
                         name="vatAmount"
                         [(ngModel)]="extractedInvoice.vatAmount" 
                         step="0.01"
                         min="0"
                         (input)="calculateTotal()"
                         class="form-control">
                </div>
                <div class="form-group">
                  <label for="totalAmount">Total Amount *</label>
                  <input type="number" 
                         id="totalAmount" 
                         name="totalAmount"
                         [(ngModel)]="extractedInvoice.totalAmount" 
                         step="0.01"
                         min="0"
                         required
                         class="form-control total-field">
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="resetUpload()">
                Cancel
              </button>
              <button type="button" 
                      class="btn-primary" 
                      [disabled]="!invoiceForm.form.valid || isSaving"
                      (click)="saveInvoice()">
                {{ isSaving ? 'Saving...' : 'Save Invoice' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 2rem;
    }

    .upload-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    h2 {
      color: #333;
      margin-bottom: 0.5rem;
      font-size: 2rem;
      font-weight: 600;
    }

    .subtitle {
      color: #666;
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }

    .upload-area {
      border: 2px dashed #ddd;
      border-radius: 8px;
      padding: 3rem 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 2rem;
    }

    .upload-area:hover,
    .upload-area.dragover {
      border-color: #667eea;
      background: #f8f9ff;
    }

    .upload-content {
      pointer-events: none;
    }

    .upload-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .upload-content p {
      margin: 0.5rem 0;
      color: #666;
    }

    .file-types {
      font-size: 0.9rem;
      color: #999;
    }

    .selected-file {
      background: #f8f9ff;
      border: 1px solid #e1e5f2;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 2rem;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .file-name {
      font-weight: 500;
      color: #333;
    }

    .file-size {
      color: #666;
      font-size: 0.9rem;
    }

    .remove-btn {
      background: #ff4757;
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
      margin-left: auto;
    }

    .upload-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      transition: all 0.3s ease;
    }

    .upload-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .upload-btn:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .progress-bar {
      width: 100%;
      height: 4px;
      background: #f0f0f0;
      border-radius: 2px;
      margin: 1rem 0;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transition: width 0.3s ease;
    }

    .error-message {
      background: #ffe6e6;
      color: #d63031;
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem 0;
      border-left: 4px solid #d63031;
    }

    .extracted-form {
      margin-top: 2rem;
      padding: 2rem;
      background: #f8fff8;
      border: 1px solid #d4edda;
      border-radius: 8px;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #d4edda;
    }

    .form-header h3 {
      color: #155724;
      margin: 0;
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .form-section h4 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      font-weight: 600;
      color: #555;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .total-field {
      background: #f8f9fa;
      font-weight: 600;
      color: #27ae60;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #d4edda;
    }
  `]
})
export class UploadComponent {
  selectedFile: File | null = null;
  isDragOver = false;
  isUploading = false;
  isSaving = false;
  uploadProgress = 0;
  errorMessage = '';
  extractedInvoice: Invoice | null = null;

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
        
        if (response.success && response.invoice) {
          this.extractedInvoice = { ...response.invoice };
          // Format date for input
          if (this.extractedInvoice.date) {
            this.extractedInvoice.date = this.extractedInvoice.date.split('T')[0];
          }
        } else {
          this.errorMessage = response.message || 'Upload failed';
        }
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.uploadProgress = 0;
        this.isUploading = false;
        this.errorMessage = error.message || 'Upload failed. Please try again.';
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
    if (!this.extractedInvoice) return;

    this.isSaving = true;
    this.errorMessage = '';

    // Use createInvoice if no ID, updateInvoice if has ID
    const saveObservable = this.extractedInvoice.id 
      ? this.invoiceService.updateInvoice(this.extractedInvoice)
      : this.invoiceService.createInvoice(this.extractedInvoice);

    saveObservable.subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success && response.data) {
          this.router.navigate(['/invoice', response.data.id]);
        } else {
          this.errorMessage = response.message || 'Failed to save invoice';
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = error.message || 'Failed to save invoice';
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
