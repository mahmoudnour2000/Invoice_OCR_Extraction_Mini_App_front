import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';

@Component({
  selector: 'app-invoice-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="invoice-edit-container">
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading invoice...</p>
      </div>

      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
        <button class="btn-secondary" [routerLink]="['/invoice', invoiceId]">Back to Invoice</button>
      </div>

      <div *ngIf="!loading && invoice" class="invoice-edit">
        <div class="header">
          <h1>Edit Invoice {{ invoice.invoiceNumber }}</h1>
          <div class="header-actions">
            <button class="btn-secondary" [routerLink]="['/invoice', invoiceId]">
              Cancel
            </button>
            <button class="btn-primary" (click)="saveInvoice()" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <form class="invoice-form" (ngSubmit)="saveInvoice()" #invoiceForm="ngForm">
          <div class="form-section">
            <h3>Invoice Information</h3>
            <div class="form-grid">
              <div class="form-group">
                <label for="invoiceNumber">Invoice Number *</label>
                <input type="text" 
                       id="invoiceNumber" 
                       name="invoiceNumber"
                       [(ngModel)]="invoice.invoiceNumber" 
                       required
                       class="form-control">
              </div>
              <div class="form-group">
                <label for="date">Date *</label>
                <input type="date" 
                       id="date" 
                       name="date"
                       [(ngModel)]="invoice.date" 
                       required
                       class="form-control">
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Vendor Information</h3>
            <div class="form-grid">
              <div class="form-group">
                <label for="vendorName">Vendor Name *</label>
                <input type="text" 
                       id="vendorName" 
                       name="vendorName"
                       [(ngModel)]="invoice.vendorName" 
                       required
                       class="form-control">
              </div>
              <div class="form-group full-width">
                <label for="vendorAddress">Vendor Address</label>
                <textarea id="vendorAddress" 
                          name="vendorAddress"
                          [(ngModel)]="invoice.vendorAddress" 
                          rows="3"
                          class="form-control"></textarea>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Customer Information</h3>
            <div class="form-grid">
              <div class="form-group">
                <label for="customerName">Customer Name *</label>
                <input type="text" 
                       id="customerName" 
                       name="customerName"
                       [(ngModel)]="invoice.customerName" 
                       required
                       class="form-control">
              </div>
              <div class="form-group full-width">
                <label for="customerAddress">Customer Address</label>
                <textarea id="customerAddress" 
                          name="customerAddress"
                          [(ngModel)]="invoice.customerAddress" 
                          rows="3"
                          class="form-control"></textarea>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Financial Information</h3>
            <div class="form-grid">
              <div class="form-group">
                <label for="subtotal">Subtotal *</label>
                <input type="number" 
                       id="subtotal" 
                       name="subtotal"
                       [(ngModel)]="invoice.subtotal" 
                       step="0.01"
                       min="0"
                       required
                       (input)="calculateTotal()"
                       class="form-control">
              </div>
              <div class="form-group">
                <label for="vatAmount">VAT/Tax Amount *</label>
                <input type="number" 
                       id="vatAmount" 
                       name="vatAmount"
                       [(ngModel)]="invoice.vatAmount" 
                       step="0.01"
                       min="0"
                       required
                       (input)="calculateTotal()"
                       class="form-control">
              </div>
              <div class="form-group">
                <label for="totalAmount">Total Amount</label>
                <input type="number" 
                       id="totalAmount" 
                       name="totalAmount"
                       [(ngModel)]="invoice.totalAmount" 
                       step="0.01"
                       min="0"
                       readonly
                       class="form-control total-field">
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" [routerLink]="['/invoice', invoiceId]">
              Cancel
            </button>
            <button type="submit" class="btn-primary" [disabled]="!invoiceForm.form.valid || saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .invoice-edit-container {
      max-width: 1000px;
      margin: 2rem auto;
      padding: 0 2rem;
    }

    .loading {
      text-align: center;
      padding: 3rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      background: #ffe6e6;
      color: #d63031;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      border-left: 4px solid #d63031;
    }

    .invoice-edit {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
    }

    .header-actions {
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
      display: inline-block;
      text-align: center;
    }

    .btn-primary {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary:not(:disabled):hover, .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }

    .invoice-form {
      padding: 2rem;
    }

    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .form-section:last-of-type {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .form-section h3 {
      color: #333;
      margin-bottom: 1.5rem;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      color: #333;
      font-weight: 600;
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }

    .form-control:invalid {
      border-color: #dc3545;
    }

    .total-field {
      background: #f8f9fa;
      color: #27ae60;
      font-weight: 600;
      font-size: 1.1rem;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 80px;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 2rem;
      border-top: 1px solid #f0f0f0;
      margin-top: 2rem;
    }

    .form-actions .btn-primary,
    .form-actions .btn-secondary {
      background: #667eea;
      color: white;
      border: 1px solid #667eea;
    }

    .form-actions .btn-secondary {
      background: #f8f9fa;
      color: #667eea;
    }

    .form-actions .btn-primary:hover,
    .form-actions .btn-secondary:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }
      
      .header-actions {
        justify-content: center;
      }
      
      .form-grid {
        grid-template-columns: 1fr;
      }
      
      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class InvoiceEditComponent implements OnInit {
  invoice: Invoice | null = null;
  loading = false;
  saving = false;
  errorMessage = '';
  invoiceId: number = 0;

  constructor(
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.invoiceId = +params['id'];
      if (this.invoiceId) {
        this.loadInvoice();
      } else {
        this.errorMessage = 'Invalid invoice ID';
      }
    });
  }

  loadInvoice() {
    this.loading = true;
    this.errorMessage = '';

    this.invoiceService.getInvoiceById(this.invoiceId).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.invoice = { ...response.data };
          // Ensure date is in the correct format for date input
          if (this.invoice.date) {
            this.invoice.date = this.invoice.date.split('T')[0];
          }
        } else {
          this.errorMessage = response.message || 'Failed to load invoice';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to load invoice';
      }
    });
  }

  calculateTotal() {
    if (this.invoice) {
      this.invoice.totalAmount = (this.invoice.subtotal || 0) + (this.invoice.vatAmount || 0);
    }
  }

  saveInvoice() {
    if (!this.invoice) return;

    this.saving = true;
    this.errorMessage = '';

    this.invoiceService.updateInvoice(this.invoice).subscribe({
      next: (response) => {
        this.saving = false;
        if (response.success) {
          this.router.navigate(['/invoice', this.invoiceId]);
        } else {
          this.errorMessage = response.message || 'Failed to save invoice';
        }
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage = error.message || 'Failed to save invoice';
      }
    });
  }
}