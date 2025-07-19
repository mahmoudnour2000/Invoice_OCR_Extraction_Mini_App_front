import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/upload',
    pathMatch: 'full'
  },
  {
    path: 'upload',
    loadComponent: () => import('./components/upload/upload.component').then(m => m.UploadComponent),
    title: 'Upload Invoice'
  },
  {
    path: 'invoices',
    loadComponent: () => import('./components/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent),
    title: 'Invoice List'
  },
  {
    path: 'invoice/:id',
    loadComponent: () => import('./components/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent),
    title: 'Invoice Details'
  },
  {
    path: 'invoice/:id/edit',
    loadComponent: () => import('./components/invoice-edit/invoice-edit.component').then(m => m.InvoiceEditComponent),
    title: 'Edit Invoice'
  },
  {
    path: 'create-invoice',
    loadComponent: () => import('./components/invoice-create/invoice-create.component').then(m => m.InvoiceCreateComponent),
    title: 'Create Invoice'
  },
  {
    path: '**',
    redirectTo: '/upload'
  }
];