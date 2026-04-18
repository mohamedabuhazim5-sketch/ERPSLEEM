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
import { queryKeys } from '../../lib/queryKeys';
import { createPurchaseInvoice, getProductsForPurchase, getSupplierOptions } from './purchases.service';

export default function PurchasesPage({ embedded = false }) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [qty, setQty] = useState(1);
  const [unitCost, setUnitCost] = useState('');
  const [cart, setCart] = useState([]);
  const [paidAmount, setPaidAmount] = useState('');
  const [discount, setDiscount] = useState('0');
  const [extraCost, setExtraCost] = useState('0');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data: products = [] } = useQuery({ queryKey: queryKeys.purchasesOptions, queryFn: getProductsForPurchase });
  const { data: suppliers = [] } = useQuery({ queryKey: [...queryKeys.purchasesOptions, 'suppliers'], queryFn: getSupplierOptions });
  const createMutation = useMutation({
    mutationFn: createPurchaseInvoice,
    onSuccess: async (purchaseId) => {
      setMessage(`تم حفظ فاتورة الشراء بنجاح. رقم العملية: ${purchaseId}`);
      setError('');
      setCart([]); setSupplierId(''); setPaidAmount(''); setDiscount('0'); setExtraCost('0'); setNotes(''); setUnitCost(''); setQty(1); setSelectedId('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.purchasesHistory }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardCounts }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products }),
        queryClient.invalidateQueries({ queryKey: queryKeys.suppliers }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reportsSummary }),
        queryClient.invalidateQueries({ queryKey: queryKeys.purchasesOptions }),
      ]);
    },
    onError: (err) => setError(err.message || 'تعذر حفظ فاتورة الشراء'),
  });

  function addToCart() {
    const product = products.find((item) => item.id === selectedId);
    const numericQty = Number(qty || 0);
    const numericCost = Number(unitCost || product?.purchase_price || 0);
    if (!product || numericQty <= 0) return;
    setCart((prev) => [...prev, { id: product.id, name: product.name, qty: numericQty, unit_cost: numericCost, total: numericQty * numericCost }]);
  }
  function removeFromCart(index) { setCart((prev) => prev.filter((_, i) => i !== index)); }
  const selectedSupplier = suppliers.find((supplier) => supplier.id === supplierId);
  const summary = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const total = subtotal - Number(discount || 0) + Number(extraCost || 0);
    const due = Math.max(total - Number(paidAmount || 0), 0);
    const itemsCount = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    return { subtotal, total, due, itemsCount };
  }, [cart, discount, extraCost, paidAmount]);
  function handleSavePurchase() {
    if (cart.length === 0) { setError('أضف صنفًا واحدًا على الأقل'); return; }
    createMutation.mutate({ supplier_id: supplierId || null, paid_amount: Number(paidAmount || 0), discount: Number(discount || 0), extra_cost: Number(extraCost || 0), notes, items: cart.map((item) => ({ product_id: item.id, qty: item.qty, unit_cost: item.unit_cost })) });
  }
  return (<div className="space-y-6" dir="rtl">{!embedded ? <PageHeader title="الوارد / المشتريات" subtitle="إضافة مشتريات وتحديث المخزون والتكلفة تلقائيًا" /> : null}{error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">{error}</div> : null}{message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 shadow-sm">{message}</div> : null}<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard title="عدد العناصر" value={summary.itemsCount} hint="إجمالي الكميات داخل الفاتورة" /><StatCard title="إجمالي الفاتورة" value={formatCurrency(summary.total)} hint="بعد الخصم والمصاريف الإضافية" /><StatCard title="المتبقي" value={formatCurrency(summary.due)} hint="المبلغ غير المسدد للمورد" /><StatCard title="إجمالي قبل الخصم" value={formatCurrency(summary.subtotal)} hint="قيمة الأصناف فقط" /></div><div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]"><SectionCard title="عناصر فاتورة الشراء" subtitle="اختر المورد ثم أضف الأصناف والكميات وتكلفة الشراء" actions={selectedSupplier ? <StatusBadge value="info" label={selectedSupplier.name} /> : null}><div className="space-y-4"><FormSelect label="المورد" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}><option value="">بدون مورد محدد</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name} — رصيد {formatCurrency(supplier.balance)}</option>)}</FormSelect><div className="grid gap-3 lg:grid-cols-[1.4fr_0.5fr_0.6fr_0.45fr]"><FormSelect label="الصنف" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}><option value="">اختر منتج</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</FormSelect><FormInput label="الكمية" type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="1" /><FormInput label="سعر الشراء" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="0" type="number" /><div className="flex items-end"><ActionButton onClick={addToCart} fullWidth>إضافة</ActionButton></div></div><div className="overflow-hidden rounded-[24px] border border-slate-200"><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="p-4 text-right">الصنف</th><th className="p-4 text-right">الكمية</th><th className="p-4 text-right">سعر الشراء</th><th className="p-4 text-right">الإجمالي</th><th className="p-4 text-right">حذف</th></tr></thead><tbody>{cart.map((item, index) => <tr key={`${item.id}-${index}`} className="border-t border-slate-100 bg-white"><td className="p-4 font-semibold text-slate-900">{item.name}</td><td className="p-4">{item.qty}</td><td className="p-4">{formatCurrency(item.unit_cost)}</td><td className="p-4 font-bold">{formatCurrency(item.total)}</td><td className="p-4"><ActionButton variant="danger" onClick={() => removeFromCart(index)} className="px-3 py-2">حذف</ActionButton></td></tr>)}{cart.length === 0 ? <tr><td colSpan="5" className="p-6"><EmptyState title="فاتورة الشراء فارغة" description="اختر صنفًا وحدد الكمية وسعر الشراء لإضافته إلى الفاتورة." /></td></tr> : null}</tbody></table></div></div></div></SectionCard><SectionCard title="الملخص والدفع" subtitle="راجع تكاليف الوارد قبل الحفظ"><div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1"><FormInput label="المدفوع" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} placeholder="0" type="number" /><FormInput label="الخصم" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" type="number" /><FormInput label="مصاريف إضافية" value={extraCost} onChange={(e) => setExtraCost(e.target.value)} placeholder="0" type="number" /></div><FormTextarea label="ملاحظات" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="تفاصيل أو ملاحظات على فاتورة الشراء" /><div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 text-sm"><div className="flex items-center justify-between"><span className="text-slate-500">الإجمالي قبل الخصم</span><strong>{formatCurrency(summary.subtotal)}</strong></div><div className="flex items-center justify-between"><span className="text-slate-500">الخصم</span><strong>{formatCurrency(discount)}</strong></div><div className="flex items-center justify-between"><span className="text-slate-500">المصاريف الإضافية</span><strong>{formatCurrency(extraCost)}</strong></div><div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-black"><span>الإجمالي النهائي</span><strong>{formatCurrency(summary.total)}</strong></div><div className="flex items-center justify-between"><span className="text-slate-500">المتبقي</span><strong>{formatCurrency(summary.due)}</strong></div></div><ActionButton onClick={handleSavePurchase} disabled={createMutation.isPending} fullWidth>{createMutation.isPending ? 'جاري حفظ الفاتورة...' : 'حفظ فاتورة الشراء'}</ActionButton></div></SectionCard></div></div>);
}
