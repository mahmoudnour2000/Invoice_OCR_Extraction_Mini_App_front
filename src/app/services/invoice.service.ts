import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Invoice, InvoiceDetails, UploadResponse, ApiResponse } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private baseUrl = 'http://localhost:5000/api';
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // Upload Controller Methods
  uploadInvoice(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Don't set any headers for FormData - let browser handle it
    return this.http.post<UploadResponse>(`${this.baseUrl}/Upload`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Invoice Controller Methods
  createInvoice(invoice: Invoice): Observable<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>(`${this.baseUrl}/Invoice`, invoice, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  getInvoiceById(id: number): Observable<ApiResponse<Invoice>> {
    return this.http.get<ApiResponse<Invoice>>(`${this.baseUrl}/Invoice/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getInvoicesByCustomer(customerName: string): Observable<ApiResponse<Invoice[]>> {
    return this.http.get<ApiResponse<Invoice[]>>(`${this.baseUrl}/Invoice/customer/${encodeURIComponent(customerName)}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getInvoiceDetails(invoiceId: number): Observable<ApiResponse<InvoiceDetails>> {
    return this.http.get<ApiResponse<InvoiceDetails>>(`${this.baseUrl}/Invoice/details/${invoiceId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateInvoice(invoice: Invoice): Observable<ApiResponse<Invoice>> {
    return this.http.put<ApiResponse<Invoice>>(`${this.baseUrl}/Invoice`, invoice, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  getAllInvoices(): Observable<ApiResponse<Invoice[]>> {
    return this.http.get<ApiResponse<Invoice[]>>(`${this.baseUrl}/Invoice`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running on https://localhost:5001 and CORS is configured to allow requests from http://localhost:4200';
      } else {
        errorMessage = error.error?.message || `Server Error: ${error.status}`;
      }
    }
    
    console.error('Invoice Service Error:', {
      status: error.status,
      message: errorMessage,
      url: error.url
    });
    
    return throwError(() => new Error(errorMessage));
  }
}
