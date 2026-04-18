import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import ActionButton from '../../components/ui/ActionButton';
import StatCard from '../../components/ui/StatCard';
import FormInput from '../../components/form/FormInput';
import FormCheckbox from '../../components/form/FormCheckbox';
import { queryKeys } from '../../lib/queryKeys';
import { getSettings, updateSettings } from './settings.service';

export default function SettingsPage({ embedded = false }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { data: values, isLoading: loading } = useQuery({ queryKey: queryKeys.settings, queryFn: getSettings });
  const mutation = useMutation({
    mutationFn: ({ id, payload }) => updateSettings(id, payload),
    onSuccess: async () => {
      setMessage('تم حفظ الإعدادات بنجاح');
      setError('');
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
    onError: (err) => { setMessage(''); setError(err.message || 'تعذر حفظ الإعدادات'); },
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    queryClient.setQueryData(queryKeys.settings, (prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    mutation.mutate({ id: values.id, payload: values });
  }

  if (loading || !values) return <div dir="rtl" className="rounded-[26px] border border-white/70 bg-white/80 p-6 shadow-sm">جاري التحميل...</div>;

  return (
    <div className="space-y-6" dir="rtl">
      {!embedded ? <PageHeader title="الإعدادات" subtitle="إعدادات الشركة والفواتير والعملة والضريبة" /> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">{message}</div> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard title="العملة" value={values.currency || '-'} /><StatCard title="الضريبة" value={`${values.tax_rate || 0}%`} hint={values.tax_enabled ? 'مفعلة' : 'غير مفعلة'} /><StatCard title="بادئة البيع" value={values.invoice_prefix_sales || '-'} /><StatCard title="تنبيه المخزون" value={values.low_stock_threshold || 0} /></div>
      <SectionCard title="بيانات الشركة والإعدادات العامة"><form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2"><FormInput label="اسم الشركة" name="company_name" value={values.company_name || ''} onChange={handleChange} placeholder="اسم الشركة" /><FormInput label="رقم الهاتف" name="phone" value={values.phone || ''} onChange={handleChange} placeholder="رقم الهاتف" /><FormInput label="العنوان" name="address" value={values.address || ''} onChange={handleChange} placeholder="العنوان" containerClassName="md:col-span-2" /><FormInput label="العملة" name="currency" value={values.currency || ''} onChange={handleChange} placeholder="العملة" /><FormInput label="نسبة الضريبة" name="tax_rate" value={values.tax_rate || ''} onChange={handleChange} placeholder="نسبة الضريبة" /><FormInput label="بادئة فواتير البيع" name="invoice_prefix_sales" value={values.invoice_prefix_sales || ''} onChange={handleChange} placeholder="بادئة فواتير البيع" /><FormInput label="بادئة فواتير الشراء" name="invoice_prefix_purchases" value={values.invoice_prefix_purchases || ''} onChange={handleChange} placeholder="بادئة فواتير الشراء" /><FormInput label="حد التنبيه للمخزون" name="low_stock_threshold" value={values.low_stock_threshold || ''} onChange={handleChange} placeholder="حد التنبيه للمخزون" /><FormCheckbox name="tax_enabled" checked={Boolean(values.tax_enabled)} onChange={handleChange} label="تفعيل الضريبة" /><FormCheckbox name="dark_mode" checked={Boolean(values.dark_mode)} onChange={handleChange} label="تفعيل الوضع الليلي" /><div className="md:col-span-2"><ActionButton type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</ActionButton></div></form></SectionCard>
    </div>
  );
}
