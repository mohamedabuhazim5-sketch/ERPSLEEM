import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import FormInput from '../../components/form/FormInput';
import FormSelect from '../../components/form/FormSelect';
import FormTextarea from '../../components/form/FormTextarea';
import ActionButton from '../../components/ui/ActionButton';
import { queryKeys } from '../../lib/queryKeys';
import { createPaymentVoucher } from './finance.service';

export default function PaymentVoucherPage() {
  const queryClient = useQueryClient();
  const [supplierId, setSupplierId] = useState('');
  const [purchaseId, setPurchaseId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationFn: createPaymentVoucher,
    onSuccess: async (id) => {
      setMessage(`تم إنشاء سند الدفع بنجاح: ${id}`);
      setError('');
      setAmount('');
      setNotes('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.suppliers }),
        queryClient.invalidateQueries({ queryKey: queryKeys.purchasesHistory }),
      ]);
    },
    onError: (err) => setError(err.message || 'تعذر إنشاء سند الدفع'),
  });
  function handleSubmit(e) { e.preventDefault(); mutation.mutate({ supplier_id: supplierId || null, purchase_id: purchaseId || null, amount: Number(amount || 0), payment_method: paymentMethod, notes }); }
  return <div className="space-y-6" dir="rtl"><PageHeader title="سند دفع" subtitle="تسجيل دفعة لمورد أو على فاتورة شراء" />{error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}{message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">{message}</div> : null}<form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"><FormInput label="معرف المورد" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} placeholder="Supplier ID" /><FormInput label="معرف فاتورة الشراء" value={purchaseId} onChange={(e) => setPurchaseId(e.target.value)} placeholder="Purchase ID (اختياري)" /><FormInput label="القيمة" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="القيمة" type="number" /><FormSelect label="طريقة الدفع" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}><option value="cash">كاش</option><option value="transfer">تحويل</option></FormSelect><FormTextarea label="ملاحظات" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات" containerClassName="md:col-span-2" /><div className="md:col-span-2"><ActionButton type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'جاري الحفظ...' : 'حفظ سند الدفع'}</ActionButton></div></form></div>;
}
