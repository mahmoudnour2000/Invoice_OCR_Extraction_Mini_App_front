import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { InvoiceDetails } from '../../models/invoice.model';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="invoice-detail-container">
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading invoice details...</p>
      </div>

      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
        <button class="btn-secondary" routerLink="/invoices">Back to Invoices</button>
      </div>

      <div *ngIf="!loading && invoice" class="invoice-detail">
        <div class="header">
          <div class="header-left">
            <h1>Invoice {{ invoice.invoiceNumber }}</h1>
            <p class="invoice-date">{{ invoice.date | date:'fullDate' }}</p>
          </div>
          <div class="header-actions">
            <button class="btn-secondary" routerLink="/invoices">
              ← Back to List
            </button>
            <button class="btn-primary" [routerLink]="['/invoice', invoice.id, 'edit']">
              Edit Invoice
            </button>
          </div>
        </div>

        <div class="invoice-content">
          <div class="parties-section">
            <div class="vendor-info">
              <h3>From (Vendor)</h3>
              <div class="info-card">
                <h4>{{ invoice.vendorName }}</h4>
                <p class="address">{{ invoice.vendorAddress }}</p>
              </div>
            </div>

            <div class="customer-info">
              <h3>To (Customer)</h3>
              <div class="info-card">
                <h4>{{ invoice.customerName }}</h4>
                <p class="address">{{ invoice.customerAddress }}</p>
              </div>
            </div>
          </div>

          <div *ngIf="invoice.lineItems && invoice.lineItems.length > 0" class="line-items-section">
            <h3>Line Items</h3>
            <div class="table-container">
              <table class="line-items-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of invoice.lineItems">
                    <td class="description">{{ item.description }}</td>
                    <td class="quantity">{{ item.quantity }}</td>
                    <td class="unit-price">\${{ item.unitPrice | number:'1.2-2' }}</td>
                    <td class="total-price">\${{ item.totalPrice | number:'1.2-2' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="totals-section">
            <div class="totals-card">
              <div class="total-row">
                <span class="label">Subtotal:</span>
                <span class="value">\${{ invoice.subtotal | number:'1.2-2' }}</span>
              </div>
              <div class="total-row">
                <span class="label">VAT/Tax:</span>
                <span class="value">\${{ invoice.vatAmount | number:'1.2-2' }}</span>
              </div>
              <div class="total-row final-total">
                <span class="label">Total Amount:</span>
                <span class="value">\${{ invoice.totalAmount | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <div *ngIf="invoice.createdAt || invoice.updatedAt" class="metadata-section">
            <h3>Invoice Metadata</h3>
            <div class="metadata-grid">
              <div *ngIf="invoice.createdAt" class="metadata-item">
                <span class="label">Created:</span>
                <span class="value">{{ invoice.createdAt | date:'medium' }}</span>
              </div>
              <div *ngIf="invoice.updatedAt" class="metadata-item">
                <span class="label">Last Updated:</span>
                <span class="value">{{ invoice.updatedAt | date:'medium' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .invoice-detail-container {
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

    .invoice-detail {
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

    .invoice-date {
      margin: 0.5rem 0 0 0;
      opacity: 0.9;
      font-size: 1.1rem;
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

    .btn-primary:hover, .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }

    .invoice-content {
      padding: 2rem;
    }

    .parties-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .vendor-info h3, .customer-info h3 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .info-card {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
    }

    .info-card h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .address {
      color: #666;
      margin: 0;
      line-height: 1.5;
      white-space: pre-line;
    }

    .line-items-section {
      margin-bottom: 2rem;
    }

    .line-items-section h3 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .table-container {
      overflow-x: auto;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .line-items-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
    }

    .line-items-table th {
      background: #f8f9fa;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 1px solid #e9ecef;
    }

    .line-items-table td {
      padding: 1rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .line-items-table tr:last-child td {
      border-bottom: none;
    }

    .description {
      color: #333;
      font-weight: 500;
    }

    .quantity, .unit-price, .total-price {
      text-align: right;
      color: #666;
    }

    .total-price {
      font-weight: 600;
      color: #333;
    }

    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 2rem;
    }

    .totals-card {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      min-width: 300px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      padding: 0.25rem 0;
    }

    .total-row:last-child {
      margin-bottom: 0;
    }

    .total-row .label {
      color: #666;
      font-weight: 500;
    }

    .total-row .value {
      color: #333;
      font-weight: 600;
    }

    .final-total {
      border-top: 2px solid #e9ecef;
      padding-top: 0.75rem;
      margin-top: 0.5rem;
    }

    .final-total .label {
      color: #333;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .final-total .value {
      color: #27ae60;
      font-weight: 700;
      font-size: 1.2rem;
    }

    .metadata-section h3 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .metadata-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .metadata-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .metadata-item .label {
      color: #666;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .metadata-item .value {
      color: #333;
      font-weight: 500;
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
      
      .parties-section {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .totals-section {
        justify-content: stretch;
      }
      
      .totals-card {
        min-width: auto;
      }
    }
  `]
})
export class InvoiceDetailComponent implements OnInit {
  invoice: InvoiceDetails | null = null;
  loading = false;
  errorMessage = '';
  invoiceId: number = 0;

  constructor(
    private invoiceService: InvoiceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.invoiceId = +params['id'];
      if (this.invoiceId) {
        this.loadInvoiceDetails();
      } else {
        this.errorMessage = 'Invalid invoice ID';
      }
    });
  }

  loadInvoiceDetails() {
    this.loading = true;
    this.errorMessage = '';

    this.invoiceService.getInvoiceDetails(this.invoiceId).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.invoice = response.data;
        } else {
          this.errorMessage = response.message || 'Failed to load invoice details';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to load invoice details';
      }
    });
  }
}