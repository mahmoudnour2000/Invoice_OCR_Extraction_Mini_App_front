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
    
    const headers = new HttpHeaders();
    // Remove Content-Type header to let browser set it with boundary for FormData
    
    return this.http.post<UploadResponse>(`${this.baseUrl}/Upload`, formData, { headers })
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
    const baseUrl = 'http://localhost:5000/api';
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error or CORS issue
      if (error.status === 0) {
        errorMessage = `Network connection failed to backend server. Please check:

1. Backend server status:
   - Ensure your backend is running on http://localhost:5000
   - Check if the server started without errors
   - Verify the API endpoints are accessible

2. CORS configuration:
   - Backend must allow requests from http://localhost:4200
   - Check CORS headers in backend response

3. Network connectivity:
   - Verify no firewall is blocking localhost connections
   - Check if antivirus software is interfering
   - Try accessing http://localhost:5000/api directly in browser

4. Port conflicts:
   - Ensure port 5000 is not used by another application
   - Check if backend is running on a different port`;
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.message}`;
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
      }
    }
    
    console.error('Invoice Service Error Details:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message,
      error: error.error,
      timestamp: new Date().toISOString(),
      troubleshooting: 'Check browser Network tab for more details'
    });
    
    // Additional debugging for status 0 errors
    if (error.status === 0) {
      console.warn('🔍 Debugging tips for status 0 errors:');
      console.warn('- Open browser DevTools → Network tab');
      console.warn('- Look for failed requests to localhost:5000');
      console.warn('- Check if request shows "CORS error" or "net::ERR_CONNECTION_REFUSED"');
      console.warn('- Verify backend server logs for incoming requests');
    }
    
    return throwError(() => new Error(errorMessage));
  }
}