import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="invoice-list-container">
      <div class="header">
        <h2>Invoice Management</h2>
        <button class="btn-primary" routerLink="/create-invoice">
          + Create New Invoice
        </button>
      </div>

      <div class="filters">
        <div class="search-box">
          <input type="text" 
                 placeholder="Search by customer name..." 
                 [(ngModel)]="searchTerm"
                 (input)="onSearchChange()"
                 class="search-input">
          <button class="search-btn" (click)="searchInvoices()">🔍</button>
        </div>
        <button class="btn-secondary" (click)="loadAllInvoices()">
          Show All
        </button>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading invoices...</p>
      </div>

      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div *ngIf="!loading && invoices.length === 0 && !errorMessage" class="empty-state">
        <div class="empty-icon">📄</div>
        <h3>No invoices found</h3>
        <p>Start by uploading an invoice or creating one manually.</p>
        <button class="btn-primary" routerLink="/upload">Upload Invoice</button>
      </div>

      <div *ngIf="!loading && invoices.length > 0" class="invoice-grid">
        <div *ngFor="let invoice of invoices" class="invoice-card">
          <div class="invoice-header">
            <h3>{{ invoice.invoiceNumber }}</h3>
            <span class="invoice-date">{{ invoice.date | date:'shortDate' }}</span>
          </div>
          
          <div class="invoice-details">
            <div class="detail-row">
              <span class="label">Vendor:</span>
              <span class="value">{{ invoice.vendorName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Customer:</span>
              <span class="value">{{ invoice.customerName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Total:</span>
              <span class="value amount">\${{ invoice.totalAmount | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="invoice-actions">
            <button class="btn-view" [routerLink]="['/invoice', invoice.id]">
              View
            </button>
            <button class="btn-edit" [routerLink]="['/invoice', invoice.id, 'edit']">
              Edit
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && invoices.length > 0" class="pagination">
        <p class="results-count">
          Showing {{ invoices.length }} invoice{{ invoices.length !== 1 ? 's' : '' }}
        </p>
      </div>
    </div>
  `,
  styles: [`
    .invoice-list-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 2rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    h2 {
      color: #333;
      font-size: 2rem;
      font-weight: 600;
      margin: 0;
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .search-box {
      display: flex;
      flex: 1;
      max-width: 400px;
    }

    .search-input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid #ddd;
      border-radius: 6px 0 0 6px;
      font-size: 1rem;
      outline: none;
    }

    .search-input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }

    .search-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 0 6px 6px 0;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .search-btn:hover {
      background: #5a6fd8;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-block;
      text-align: center;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem 0;
      border-left: 4px solid #d63031;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin-bottom: 0.5rem;
      color: #333;
    }

    .invoice-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .invoice-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      border: 1px solid #f0f0f0;
    }

    .invoice-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }

    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .invoice-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .invoice-date {
      color: #666;
      font-size: 0.9rem;
    }

    .invoice-details {
      margin-bottom: 1.5rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .label {
      color: #666;
      font-weight: 500;
    }

    .value {
      color: #333;
      font-weight: 500;
    }

    .amount {
      color: #27ae60;
      font-weight: 600;
    }

    .invoice-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn-view, .btn-edit {
      flex: 1;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      text-decoration: none;
      text-align: center;
      font-weight: 500;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .btn-view {
      background: #f8f9fa;
      color: #667eea;
      border: 1px solid #e9ecef;
    }

    .btn-edit {
      background: #667eea;
      color: white;
    }

    .btn-view:hover, .btn-edit:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .pagination {
      text-align: center;
      padding: 1rem;
      color: #666;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: stretch;
      }
      
      .filters {
        flex-direction: column;
      }
      
      .search-box {
        max-width: none;
      }
      
      .invoice-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';
  private searchTimeout: any;

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit() {
    this.loadAllInvoices();
  }

  loadAllInvoices() {
    this.loading = true;
    this.errorMessage = '';
    this.searchTerm = '';

    this.invoiceService.getAllInvoices().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.invoices = response.data;
        } else {
          this.errorMessage = response.message || 'Failed to load invoices';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to load invoices';
      }
    });
  }

  onSearchChange() {
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Set new timeout for debounced search
    this.searchTimeout = setTimeout(() => {
      if (this.searchTerm.trim()) {
        this.searchInvoices();
      } else {
        this.loadAllInvoices();
      }
    }, 500);
  }

  searchInvoices() {
    if (!this.searchTerm.trim()) {
      this.loadAllInvoices();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.invoiceService.getInvoicesByCustomer(this.searchTerm.trim()).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.invoices = response.data;
        } else {
          this.invoices = [];
          this.errorMessage = response.message || 'No invoices found for this customer';
        }
      },
      error: (error) => {
        this.loading = false;
        this.invoices = [];
        this.errorMessage = error.message || 'Search failed';
      }
    });
  }
}