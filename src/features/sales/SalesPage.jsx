import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';
import ActionButton from '../../components/ui/ActionButton';
import EmptyState from '../../components/ui/EmptyState';
import FormSelect from '../../components/form/FormSelect';
import FormInput from '../../components/form/FormInput';
import FormTextarea from '../../components/form/FormTextarea';
import { formatCurrency } from '../../lib/format';
import { generateInvoicePdf } from '../../lib/invoice';
import { queryKeys } from '../../lib/queryKeys';
import { createSaleInvoice, getCustomerOptions, getProductsForSale } from './sales.service';

export default function SalesPage({ embedded = false }) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [discount, setDiscount] = useState('0');
  const [tax, setTax] = useState('0');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data: products = [] } = useQuery({ queryKey: queryKeys.salesOptions, queryFn: getProductsForSale });
  const { data: customers = [] } = useQuery({ queryKey: [...queryKeys.salesOptions, 'customers'], queryFn: getCustomerOptions });

  const createMutation = useMutation({
    mutationFn: createSaleInvoice,
    onSuccess: async (saleId) => {
      setMessage(`تم حفظ الفاتورة بنجاح. رقم العملية: ${saleId}`);
      setError('');
      setCart([]);
      setPaidAmount('');
      setDiscount('0');
      setTax('0');
      setNotes('');
      setCustomerId('');
      setSelectedId('');
      setQty(1);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.salesHistory }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardCounts }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardCharts }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardRecentSales }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products }),
        queryClient.invalidateQueries({ queryKey: queryKeys.customers }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reportsSummary }),
        queryClient.invalidateQueries({ queryKey: queryKeys.salesOptions }),
      ]);
    },
    onError: (err) => setError(err.message || 'تعذر حفظ الفاتورة'),
  });

  function addToCart() {
    const product = products.find((item) => item.id === selectedId);
    if (!product) return;
    const numericQty = Number(qty || 0);
    if (numericQty <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const nextQty = existing.qty + numericQty;
        return prev.map((item) => item.id === product.id ? { ...item, qty: nextQty, total: nextQty * Number(item.sale_price) } : item);
      }
      return [...prev, { ...product, qty: numericQty, total: numericQty * Number(product.sale_price) }];
    });
  }

  function removeFromCart(id) { setCart((prev) => prev.filter((item) => item.id !== id)); }
  const selectedCustomer = customers.find((customer) => customer.id === customerId);
  const summary = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const totalDiscount = Number(discount || 0);
    const totalTax = Number(tax || 0);
    const total = subtotal - totalDiscount + totalTax;
    const paid = Number(paidAmount || 0);
    const due = Math.max(total - paid, 0);
    const profit = cart.reduce((sum, item) => sum + (Number(item.sale_price || 0) - Number(item.purchase_price || 0)) * Number(item.qty || 0), 0);
    const itemsCount = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    return { subtotal, totalDiscount, totalTax, total, paid, due, profit, itemsCount };
  }, [cart, discount, tax, paidAmount]);

  function handleSaveInvoice() {
    if (cart.length === 0) { setError('أضف منتجًا واحدًا على الأقل'); return; }
    createMutation.mutate({ customer_id: customerId || null, payment_method: paymentMethod, paid_amount: summary.paid, discount: summary.totalDiscount, tax: summary.totalTax, notes, items: cart.map((item) => ({ product_id: item.id, qty: item.qty })) });
  }

  const paymentLabels = { cash: 'كاش', transfer: 'تحويل', deferred: 'آجل', mixed: 'مختلط' };

  return (<div className="space-y-6" dir="rtl">{!embedded ? <PageHeader title="المبيعات" subtitle="إنشاء فاتورة بيع وربطها بالمخزون والعميل والمدفوعات" /> : null}{error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">{error}</div> : null}{message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 shadow-sm">{message}</div> : null}<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard title="عدد العناصر" value={summary.itemsCount} hint="إجمالي الكميات داخل السلة" /><StatCard title="إجمالي الفاتورة" value={formatCurrency(summary.total)} hint="بعد الخصم والضريبة" /><StatCard title="المتبقي" value={formatCurrency(summary.due)} hint="المبلغ غير المسدد" /><StatCard title="الربح المتوقع" value={formatCurrency(summary.profit)} hint="قبل احتساب المصروفات" /></div><div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]"><SectionCard title="عناصر الفاتورة" subtitle="أضف المنتجات واختر العميل وراجع السلة قبل الحفظ" actions={<div className="flex items-center gap-2"><StatusBadge value={paymentMethod} label={paymentLabels[paymentMethod]} />{selectedCustomer ? <StatusBadge value="info" label={selectedCustomer.name} /> : null}</div>}><div className="space-y-4"><FormSelect label="العميل" value={customerId} onChange={(e) => setCustomerId(e.target.value)}><option value="">عميل نقدي / بدون عميل</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} — رصيد {formatCurrency(customer.balance)}</option>)}</FormSelect><div className="grid gap-3 lg:grid-cols-[1.4fr_0.5fr_0.45fr]"><FormSelect label="المنتج" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}><option value="">اختر منتج</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} — المتاح {product.stock_qty}</option>)}</FormSelect><FormInput label="الكمية" type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="1" /><div className="flex items-end"><ActionButton onClick={addToCart} fullWidth>إضافة للسلة</ActionButton></div></div><div className="overflow-hidden rounded-[24px] border border-slate-200"><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="p-4 text-right">المنتج</th><th className="p-4 text-right">الكمية</th><th className="p-4 text-right">سعر البيع</th><th className="p-4 text-right">الإجمالي</th><th className="p-4 text-right">حذف</th></tr></thead><tbody>{cart.map((item) => <tr key={item.id} className="border-t border-slate-100 bg-white"><td className="p-4 font-semibold text-slate-900">{item.name}</td><td className="p-4">{item.qty}</td><td className="p-4">{formatCurrency(item.sale_price)}</td><td className="p-4 font-bold">{formatCurrency(item.total)}</td><td className="p-4"><ActionButton variant="danger" onClick={() => removeFromCart(item.id)} className="px-3 py-2">حذف</ActionButton></td></tr>)}{cart.length === 0 ? <tr><td colSpan="5" className="p-6"><EmptyState title="سلة المبيعات فارغة" description="اختر منتجًا وأضفه إلى السلة حتى تبدأ إنشاء الفاتورة." /></td></tr> : null}</tbody></table></div></div></div></SectionCard><SectionCard title="الملخص والدفع" subtitle="راجع الأرقام ثم احفظ الفاتورة"><div className="space-y-4"><FormSelect label="طريقة الدفع" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}><option value="cash">كاش</option><option value="transfer">تحويل</option><option value="deferred">آجل</option><option value="mixed">مختلط</option></FormSelect><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1"><FormInput label="المدفوع" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} placeholder="0" type="number" /><FormInput label="الخصم" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" type="number" /><FormInput label="الضريبة" value={tax} onChange={(e) => setTax(e.target.value)} placeholder="0" type="number" /></div><FormTextarea label="ملاحظات" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="تفاصيل أو ملاحظات على الفاتورة" /><div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 text-sm"><div className="flex items-center justify-between"><span className="text-slate-500">الإجمالي قبل الخصم</span><strong>{formatCurrency(summary.subtotal)}</strong></div><div className="flex items-center justify-between"><span className="text-slate-500">الخصم</span><strong>{formatCurrency(summary.totalDiscount)}</strong></div><div className="flex items-center justify-between"><span className="text-slate-500">الضريبة</span><strong>{formatCurrency(summary.totalTax)}</strong></div><div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-black"><span>الإجمالي النهائي</span><strong>{formatCurrency(summary.total)}</strong></div><div className="flex items-center justify-between"><span className="text-slate-500">المتبقي</span><strong>{formatCurrency(summary.due)}</strong></div><div className="flex items-center justify-between"><span className="text-slate-500">الربح المتوقع</span><strong>{formatCurrency(summary.profit)}</strong></div></div><ActionButton onClick={handleSaveInvoice} disabled={createMutation.isPending} fullWidth>{createMutation.isPending ? 'جاري حفظ الفاتورة...' : 'حفظ الفاتورة'}</ActionButton><ActionButton type="button" variant="secondary" onClick={() => generateInvoicePdf({ invoiceNumber: 'Preview', customerName: selectedCustomer?.name || 'عميل نقدي', items: cart, subtotal: summary.subtotal, discount: summary.totalDiscount, tax: summary.totalTax, total: summary.total, paid: summary.paid, due: summary.due, notes })} fullWidth>طباعة PDF تجريبية</ActionButton></div></SectionCard></div></div>);
}
