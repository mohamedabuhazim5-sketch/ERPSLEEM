import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './format';

export function generateCustomerStatementPdf({ customer, sales = [], receipts = [] }) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Customer Statement', 14, 20);
  doc.setFontSize(11);
  doc.text(`Customer: ${customer?.name || '-'}`, 14, 30);
  doc.text(`Phone: ${customer?.phone || '-'}`, 14, 37);
  doc.text(`Balance: ${formatCurrency(customer?.balance || 0)}`, 14, 44);

  autoTable(doc, {
    startY: 54,
    head: [['Invoice', 'Date', 'Total', 'Paid', 'Due', 'Status']],
    body: sales.map((row) => [
      row.invoice_number,
      new Date(row.sale_date).toLocaleDateString('en-GB'),
      formatCurrency(row.total_amount),
      formatCurrency(row.paid_amount),
      formatCurrency(row.due_amount),
      row.status,
    ]),
  });

  const salesEndY = doc.lastAutoTable?.finalY || 70;
  doc.text('Receipts', 14, salesEndY + 12);

  autoTable(doc, {
    startY: salesEndY + 18,
    head: [['Receipt', 'Date', 'Amount', 'Method']],
    body: receipts.map((row) => [
      row.receipt_number,
      new Date(row.receipt_date).toLocaleDateString('en-GB'),
      formatCurrency(row.amount),
      row.payment_method,
    ]),
  });

  doc.save(`customer-statement-${customer?.name || 'customer'}.pdf`);
}
