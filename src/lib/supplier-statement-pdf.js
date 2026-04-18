import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './format';

export function generateSupplierStatementPdf({ supplier, purchases = [], vouchers = [] }) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Supplier Statement', 14, 20);
  doc.setFontSize(11);
  doc.text(`Supplier: ${supplier?.name || '-'}`, 14, 30);
  doc.text(`Phone: ${supplier?.phone || '-'}`, 14, 37);
  doc.text(`Balance: ${formatCurrency(supplier?.balance || 0)}`, 14, 44);

  autoTable(doc, {
    startY: 54,
    head: [['Invoice', 'Date', 'Total', 'Paid', 'Due', 'Status']],
    body: purchases.map((row) => [
      row.invoice_number,
      new Date(row.purchase_date).toLocaleDateString('en-GB'),
      formatCurrency(row.total_amount),
      formatCurrency(row.paid_amount),
      formatCurrency(row.due_amount),
      row.status,
    ]),
  });

  const purchasesEndY = doc.lastAutoTable?.finalY || 70;
  doc.text('Payment Vouchers', 14, purchasesEndY + 12);

  autoTable(doc, {
    startY: purchasesEndY + 18,
    head: [['Voucher', 'Date', 'Amount', 'Method']],
    body: vouchers.map((row) => [
      row.voucher_number,
      new Date(row.voucher_date).toLocaleDateString('en-GB'),
      formatCurrency(row.amount),
      row.payment_method,
    ]),
  });

  doc.save(`supplier-statement-${supplier?.name || 'supplier'}.pdf`);
}
