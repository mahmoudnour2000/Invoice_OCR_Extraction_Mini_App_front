import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Invoice, InvoiceDetails, UploadResponse, ApiResponse } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private baseUrl = 'https://localhost:5001/api';
  
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
    
    const headers = new HttpHeaders();
    // Remove Content-Type header to let browser set it with boundary for FormData
    
    return this.http.post<UploadResponse>(`${this.baseUrl}/Upload`, formData, { headers })
      .pipe(
        catchError((error) => {
          // If HTTPS fails with status 0, try HTTP fallback
          if (error.status === 0 && this.baseUrl.startsWith('https://')) {
            console.warn('HTTPS connection failed, attempting HTTP fallback...');
            this.baseUrl = 'http://localhost:5001/api';
            return this.http.post<UploadResponse>(`${this.baseUrl}/Upload`, formData, { headers })
              .pipe(catchError(this.handleError));
          }
          return this.handleError(error);
        }),
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
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error or CORS issue
      if (error.status === 0) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running on https://localhost:5001 and CORS is configured to allow requests from http://localhost:4200';
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.message}`;
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
      }
    }
    
    console.error('Invoice Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}