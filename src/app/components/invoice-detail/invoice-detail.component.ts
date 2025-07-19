import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { InvoiceDetails } from '../../models/invoice.model';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './invoice-detail.html',
  styleUrls: ['./invoice-detail.css']
})
export class InvoiceDetailComponent implements OnInit {
  invoice: any = null;
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
        console.log('Invoice details response:', response);
        if (Array.isArray(response) && response.length > 0) {
          this.invoice = response;
          this.errorMessage = '';
        } else if (response && (response as any).id) {
          this.invoice = response;
          this.errorMessage = '';
        } else {
          this.errorMessage = (response && (response as any).message) || 'Failed to load invoice details';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to load invoice details';
      }
    });
  }
}