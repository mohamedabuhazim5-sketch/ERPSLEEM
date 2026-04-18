# Sleem ERP

Sleem ERP is a professional web-based ERP system built with React + Supabase.
It helps manage products, sales, purchases, stock, customers, suppliers, expenses, reports, user roles, statements, receipts, payment vouchers, notifications, and audit logs.

## Features
- Authentication and role-based access
- Dashboard with KPIs and charts
- Products with image upload
- Sales and purchases linked to stock
- Customers and suppliers
- Expenses and reports
- Receipts and payment vouchers
- Customer and supplier statements
- PDF invoices and statement exports
- Notifications and audit logs
- Sales and purchase returns

## Tech Stack
- React + Vite
- Tailwind CSS
- Supabase
- PostgreSQL
- Recharts
- jsPDF

## Installation
1. Clone the project
2. Run `npm install`
3. Create `.env` based on `.env.example`
4. Run SQL files in order inside Supabase SQL editor
5. Run `npm run dev`

## Environment Variables
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Deployment
- Push to GitHub
- Connect the repo to Vercel
- Add environment variables
- Deploy

## Verified Build
- `npm install` completed successfully
- `npm run build` completed successfully in production mode
- Current note: Vite reports a large bundle-size warning only; this does not block running the app

## Security Note
- `jspdf` was updated to `^4.2.1` to address known audit issues present in older versions.
