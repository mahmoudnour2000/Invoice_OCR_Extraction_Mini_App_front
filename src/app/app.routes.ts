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
    path: '**',
    redirectTo: '/upload'
  }
];