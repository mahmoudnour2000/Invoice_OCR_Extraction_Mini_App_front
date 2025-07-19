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
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent implements OnInit {
  // نستخدم any[] لدعم الحقول الديناميكية القادمة من الباك اند مثل vat و invoiceDate
  invoices: any[] = [];
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
        console.log('Invoices response:', response);
        // دعم جميع أشكال الاستجابة
        if ((response && response.success && response.data) || Array.isArray(response)) {
          if (Array.isArray(response)) {
            this.invoices = response;
          } else if (response && response.data) {
            this.invoices = response.data;
          } else {
            this.invoices = [];
          }
          // ترتيب الفواتير تنازلياً حسب invoiceDate أو id
          this.invoices.reverse(); // عرض تنازلي دائماً بغض النظر عن الترتيب القادم
          this.errorMessage = '';
        } else {
          this.errorMessage = response.message || 'Failed to load invoices';
        }
      },
      error: (error) => {
        this.loading = false;
        if (error.message && error.message.includes('Network connection failed')) {
          this.errorMessage = 'Backend server connection failed. Please ensure your backend server is running on http://localhost:5000 and try again.';
        } else {
          this.errorMessage = error.message || 'Failed to load invoices';
        }
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
        if (error.message && error.message.includes('Network connection failed')) {
          this.errorMessage = 'Backend server connection failed. Please ensure your backend server is running on http://localhost:5000 and try again.';
        } else {
          this.errorMessage = error.message || 'Search failed';
        }
      }
    });
  }
}