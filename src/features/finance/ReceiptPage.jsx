import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import FormInput from '../../components/form/FormInput';
import FormSelect from '../../components/form/FormSelect';
import FormTextarea from '../../components/form/FormTextarea';
import ActionButton from '../../components/ui/ActionButton';
import { queryKeys } from '../../lib/queryKeys';
import { createReceipt } from './finance.service';

export default function ReceiptPage() {
  const queryClient = useQueryClient();
  const [customerId, setCustomerId] = useState('');
  const [saleId, setSaleId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationFn: createReceipt,
    onSuccess: async (id) => {
      setMessage(`تم إنشاء سند القبض بنجاح: ${id}`);
      setError('');
      setAmount('');
      setNotes('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.customers }),
        queryClient.invalidateQueries({ queryKey: queryKeys.salesHistory }),
      ]);
    },
    onError: (err) => setError(err.message || 'تعذر إنشاء سند القبض'),
  });
  function handleSubmit(e) { e.preventDefault(); mutation.mutate({ customer_id: customerId || null, sale_id: saleId || null, amount: Number(amount || 0), payment_method: paymentMethod, notes }); }
  return <div className="space-y-6" dir="rtl"><PageHeader title="سند قبض" subtitle="تسجيل تحصيل من عميل أو على فاتورة بيع" />{error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}{message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">{message}</div> : null}<form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"><FormInput label="معرف العميل" value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="Customer ID" /><FormInput label="معرف فاتورة البيع" value={saleId} onChange={(e) => setSaleId(e.target.value)} placeholder="Sale ID (اختياري)" /><FormInput label="القيمة" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="القيمة" type="number" /><FormSelect label="طريقة الدفع" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}><option value="cash">كاش</option><option value="transfer">تحويل</option></FormSelect><FormTextarea label="ملاحظات" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات" containerClassName="md:col-span-2" /><div className="md:col-span-2"><ActionButton type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'جاري الحفظ...' : 'حفظ سند القبض'}</ActionButton></div></form></div>;
}
