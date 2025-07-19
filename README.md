# Invoice OCR Management System

## Project Overview

A web-based system for managing invoices using Optical Character Recognition (OCR) technology. Users can upload invoices in PDF or image formats (JPG, PNG), automatically extract their data, review and edit the extracted information, and save invoices to the database with full search, view, and edit capabilities.

---

## Requirements
- Node.js (v16 or newer recommended)
- Angular CLI (v15 or newer recommended)
- Backend API running at http://localhost:5000 (expected to be Node/Express or any REST-compatible backend)

---

## Setup & Running
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the application:**
   ```bash
   ng serve
   ```
   Then open your browser at: [http://localhost:4200](http://localhost:4200)

3. **Make sure the backend is running** at http://localhost:5000

---

## Folder Structure

```
src/
  app/
    components/
      upload/           # Upload invoices & OCR extraction
      invoice-list/     # Invoice list & search
      invoice-detail/   # Single invoice details
      invoice-edit/     # Edit invoice
      navigation/       # Navigation bar
    models/             # Data models (Invoice, ...)
    services/           # API services
  global_styles.css     # Global styles
  index.html            # App entry point
  main.ts               # Angular bootstrap
```

---

## Main Features & UI

### 1. **Upload Invoice**
- Upload an invoice file (PDF, JPG, PNG) from the "Upload" page.
- Data is extracted automatically (invoice number, date, customer, total, etc.).
- Data appears in an editable form for review.
- Save the invoice after review.

### 2. **Invoice List**
- Displays all stored invoices.
- Search by customer name.
- View or edit any invoice.

### 3. **Invoice Details**
- Shows all data for a selected invoice.
- Displays line items (description, quantity, price, etc.).

### 4. **Edit Invoice**
- Edit any invoice data and save changes.

---

## Technical Notes
- All UI is built with Angular (standalone components).
- Templates (HTML) and styles (CSS) are separated from TypeScript code for maintainability.
- All services interact with a REST API backend.
- The design is fully responsive for all screen sizes.

---

## Developer Instructions
- To edit any UI, go to the `components` folder and find the relevant component.
- To change data structure or add new fields, update `models/invoice.model.ts` and adjust services/templates as needed.
- To change routing paths, edit `app.routes.ts`.

---

## End User Instructions
- Easily upload invoices from the "Upload" page.
- Search for any invoice by customer name.
- Edit or review any invoice from the list.
- All operations are fast and secure.

