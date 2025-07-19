import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="upload-container">
      <div class="upload-card">
        <h2>Upload Invoice</h2>
        <p class="subtitle">Upload PDF, JPG, or PNG files for OCR processing</p>
        
        <div class="upload-area" 
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

        <div *ngIf="selectedFile" class="selected-file">
          <h3>Selected File:</h3>
          <div class="file-info">
            <span class="file-name">{{ selectedFile.name }}</span>
            <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
            <button class="remove-btn" (click)="removeFile()">✕</button>
          </div>
        </div>

        <button class="upload-btn" 
                [disabled]="!selectedFile || isUploading"
                (click)="uploadFile()">
          <span *ngIf="!isUploading">Upload & Process</span>
          <span *ngIf="isUploading">Processing...</span>
        </button>

        <div *ngIf="uploadProgress > 0" class="progress-bar">
          <div class="progress-fill" [style.width.%]="uploadProgress"></div>
        </div>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div *ngIf="extractedInvoice" class="extracted-data">
          <h3>Extracted Data</h3>
          <div class="data-grid">
            <div class="data-item">
              <label>Invoice Number:</label>
              <span>{{ extractedInvoice.invoiceNumber }}</span>
            </div>
            <div class="data-item">
              <label>Date:</label>
              <span>{{ extractedInvoice.date | date }}</span>
            </div>
            <div class="data-item">
              <label>Vendor:</label>
              <span>{{ extractedInvoice.vendorName }}</span>
            </div>
            <div class="data-item">
              <label>Customer:</label>
              <span>{{ extractedInvoice.customerName }}</span>
            </div>
            <div class="data-item">
              <label>Total Amount:</label>
              <span class="amount">\${{ extractedInvoice.totalAmount | number:'1.2-2' }}</span>
            </div>
          </div>
          <div class="action-buttons">
            <button class="btn-secondary" [routerLink]="['/invoice', extractedInvoice.id]">
              View Details
            </button>
            <button class="btn-primary" [routerLink]="['/invoice', extractedInvoice.id, 'edit']">
              Edit Invoice
            </button>
          </div>
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

    .extracted-data {
      background: #f8fff8;
      border: 1px solid #d4edda;
      border-radius: 8px;
      padding: 1.5rem;
      margin-top: 2rem;
    }

    .extracted-data h3 {
      color: #155724;
      margin-bottom: 1rem;
    }

    .data-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .data-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .data-item label {
      font-weight: 600;
      color: #666;
      font-size: 0.9rem;
    }

    .data-item span {
      color: #333;
      font-size: 1rem;
    }

    .amount {
      font-weight: 600;
      color: #27ae60;
      font-size: 1.1rem;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #667eea;
      border: 1px solid #667eea;
    }

    .btn-primary:hover, .btn-secondary:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
  `]
})
export class UploadComponent {
  selectedFile: File | null = null;
  isDragOver = false;
  isUploading = false;
  uploadProgress = 0;
  errorMessage = '';
  extractedInvoice: Invoice | null = null;

  constructor(private invoiceService: InvoiceService) {}

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

    // Simulate progress
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
          this.extractedInvoice = response.invoice;
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

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}