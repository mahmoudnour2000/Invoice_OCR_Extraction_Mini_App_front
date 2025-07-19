export interface Invoice {
  id?: number;
  invoiceNumber: string;
  date: string;
  vendorName: string;
  vendorAddress: string;
  customerName: string;
  customerAddress: string;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceLineItem {
  id?: number;
  invoiceId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InvoiceDetails extends Invoice {
  lineItems: InvoiceLineItem[];
}

export interface UploadResponse {
  success: boolean;
  message: string;
  invoice?: Invoice;
  extractedData?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}