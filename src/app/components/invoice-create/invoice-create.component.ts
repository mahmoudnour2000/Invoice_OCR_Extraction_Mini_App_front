import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';

@Component({
  selector: 'app-invoice-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="invoice-create-container">
      <div class="invoice-create">
        <div class="header">
          <h1>Create New Invoice</h1>
          <div class="header-actions">
            <button class="btn-secondary" routerLink="/invoices">
              Cancel
            </button>
            <button class="btn-primary" (click)="createInvoice()" [disabled]="saving">
              {{ saving ? 'Creating...' : 'Create Invoice' }}
            </button>
          </div>
        </div>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <form class="invoice-form" (ngSubmit)="createInvoice()" #invoiceForm="ngForm">
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
                       placeholder="INV-001"
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
                       placeholder="Your Company Name"
                       class="form-control">
              </div>
              <div class="form-group full-width">
                <label for="vendorAddress">Vendor Address</label>
                <textarea id="vendorAddress" 
                          name="vendorAddress"
                          [(ngModel)]="invoice.vendorAddress" 
                          rows="3"
                          placeholder="123 Business St&#10;City, State 12345&#10;Country"
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
                       placeholder="Customer Company Name"
                       class="form-control">
              </div>
              <div class="form-group full-width">
                <label for="customerAddress">Customer Address</label>
                <textarea id="customerAddress" 
                          name="customerAddress"
                          [(ngModel)]="invoice.customerAddress" 
                          rows="3"
                          placeholder="456 Customer Ave&#10;City, State 67890&#10;Country"
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
                       placeholder="0.00"
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
                       placeholder="0.00"
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
            <button type="button" class="btn-secondary" routerLink="/invoices">
              Cancel
            </button>
            <button type="submit" class="btn-primary" [disabled]="!invoiceForm.form.valid || saving">
              {{ saving ? 'Creating...' : 'Create Invoice' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .invoice-create-container {
      max-width: 1000px;
      margin: 2rem auto;
      padding: 0 2rem;
    }

    .invoice-create {
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

    .error-message {
      background: #ffe6e6;
      color: #d63031;
      padding: 1rem 2rem;
      border-left: 4px solid #d63031;
      margin: 0;
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
export class InvoiceCreateComponent {
  invoice: Invoice = {
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    vendorName: '',
    vendorAddress: '',
    customerName: '',
    customerAddress: '',
    subtotal: 0,
    vatAmount: 0,
    totalAmount: 0
  };

  saving = false;
  errorMessage = '';

  constructor(
    private invoiceService: InvoiceService,
    private router: Router
  ) {}

  calculateTotal() {
    this.invoice.totalAmount = (this.invoice.subtotal || 0) + (this.invoice.vatAmount || 0);
  }

  createInvoice() {
    this.saving = true;
    this.errorMessage = '';

    this.invoiceService.createInvoice(this.invoice).subscribe({
      next: (response) => {
        this.saving = false;
        if (response.success && response.data) {
          this.router.navigate(['/invoice', response.data.id]);
        } else {
          this.errorMessage = response.message || 'Failed to create invoice';
        }
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage = error.message || 'Failed to create invoice';
      }
    });
  }
}