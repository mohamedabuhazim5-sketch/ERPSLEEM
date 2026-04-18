import { formatCurrency } from './format';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateInvoicePdf({
  invoiceNumber,
  customerName,
  items = [],
  subtotal,
  discount,
  tax,
  total,
  paid,
  due,
  notes,
}) {
  const printWindow = window.open('', '_blank', 'width=1000,height=900');

  if (!printWindow) {
    alert('المتصفح منع فتح نافذة الطباعة. اسمح بالنوافذ المنبثقة ثم جرّب مرة أخرى.');
    return;
  }

  const rowsHtml = items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.qty)}</td>
          <td>${escapeHtml(formatCurrency(item.sale_price))}</td>
          <td>${escapeHtml(formatCurrency(item.total))}</td>
        </tr>
      `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>فاتورة بيع - ${escapeHtml(invoiceNumber || 'sale')}</title>
        <style>
          @font-face {
            font-family: 'Tajawal';
            src: url('${window.location.origin}/fonts/Tajawal-Regular.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
          }

          * {
            box-sizing: border-box;
          }

          html, body {
            direction: rtl;
          }

          body {
            margin: 0;
            padding: 24px;
            font-family: 'Tajawal', Arial, sans-serif;
            background: #f8fafc;
            color: #0f172a;
          }

          .invoice {
            max-width: 900px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            overflow: hidden;
          }

          .header {
            padding: 28px 32px;
            background: linear-gradient(135deg, #0f172a, #1e293b);
            color: white;
          }

          .header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }

          .brand {
            font-size: 32px;
            font-weight: 700;
            margin: 0;
          }

          .sub {
            margin-top: 8px;
            color: #cbd5e1;
            font-size: 14px;
          }

          .section {
            padding: 24px 32px;
          }

          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
            margin-bottom: 10px;
          }

          .info-card {
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 14px 16px;
            background: #f8fafc;
          }

          .label {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 6px;
          }

          .value {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            overflow: hidden;
            border-radius: 14px;
          }

          thead th {
            background: #0f172a;
            color: white;
            padding: 14px;
            font-size: 14px;
            text-align: right;
          }

          tbody td {
            padding: 14px;
            border-bottom: 1px solid #e2e8f0;
            text-align: right;
            font-size: 14px;
          }

          tbody tr:nth-child(even) {
            background: #f8fafc;
          }

          .summary {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
            margin-top: 24px;
          }

          .summary-card {
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 18px;
            background: #ffffff;
          }

          .summary-line {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 8px 0;
            border-bottom: 1px dashed #e2e8f0;
          }

          .summary-line:last-child {
            border-bottom: none;
          }

          .summary-line span {
            color: #475569;
            font-size: 14px;
          }

          .summary-line strong {
            color: #0f172a;
            font-size: 15px;
          }

          .notes {
            margin-top: 24px;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 16px;
            background: #f8fafc;
          }

          .notes h3 {
            margin: 0 0 10px;
            font-size: 16px;
          }

          .notes p {
            margin: 0;
            color: #334155;
            line-height: 1.8;
          }

          .print-bar {
            max-width: 900px;
            margin: 0 auto 16px;
            display: flex;
            justify-content: flex-start;
            gap: 12px;
          }

          .print-btn {
            border: none;
            background: #0f172a;
            color: white;
            padding: 12px 18px;
            border-radius: 12px;
            cursor: pointer;
            font-family: 'Tajawal', Arial, sans-serif;
            font-size: 14px;
          }

          .print-btn.secondary {
            background: #e2e8f0;
            color: #0f172a;
          }

          @media print {
            body {
              background: white;
              padding: 0;
            }

            .print-bar {
              display: none !important;
            }

            .invoice {
              max-width: 100%;
              border: none;
              border-radius: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-bar">
          <button class="print-btn" onclick="window.print()">طباعة / حفظ PDF</button>
          <button class="print-btn secondary" onclick="window.close()">إغلاق</button>
        </div>

        <div class="invoice">
          <div class="header">
            <div class="header-top">
              <div>
                <h1 class="brand">Sleem ERP</h1>
                <div class="sub">فاتورة بيع احترافية</div>
              </div>
              <div style="text-align:left">
                <div style="font-size:14px;color:#cbd5e1">رقم الفاتورة</div>
                <div style="font-size:22px;font-weight:700">${escapeHtml(invoiceNumber || '-')}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="info-grid">
              <div class="info-card">
                <div class="label">العميل</div>
                <div class="value">${escapeHtml(customerName || 'عميل نقدي')}</div>
              </div>
              <div class="info-card">
                <div class="label">التاريخ</div>
                <div class="value">${escapeHtml(new Date().toLocaleString('ar-EG'))}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الكمية</th>
                  <th>سعر البيع</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${
                  rowsHtml ||
                  `
                    <tr>
                      <td colspan="4" style="text-align:center;color:#64748b;padding:24px">
                        لا توجد أصناف داخل الفاتورة
                      </td>
                    </tr>
                  `
                }
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-card">
                <div class="summary-line">
                  <span>الإجمالي قبل الخصم</span>
                  <strong>${escapeHtml(formatCurrency(subtotal || 0))}</strong>
                </div>
                <div class="summary-line">
                  <span>الخصم</span>
                  <strong>${escapeHtml(formatCurrency(discount || 0))}</strong>
                </div>
                <div class="summary-line">
                  <span>الضريبة</span>
                  <strong>${escapeHtml(formatCurrency(tax || 0))}</strong>
                </div>
              </div>

              <div class="summary-card">
                <div class="summary-line">
                  <span>الإجمالي النهائي</span>
                  <strong>${escapeHtml(formatCurrency(total || 0))}</strong>
                </div>
                <div class="summary-line">
                  <span>المدفوع</span>
                  <strong>${escapeHtml(formatCurrency(paid || 0))}</strong>
                </div>
                <div class="summary-line">
                  <span>المتبقي</span>
                  <strong>${escapeHtml(formatCurrency(due || 0))}</strong>
                </div>
              </div>
            </div>

            ${
              notes
                ? `
                  <div class="notes">
                    <h3>ملاحظات</h3>
                    <p>${escapeHtml(notes)}</p>
                  </div>
                `
                : ''
            }
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
