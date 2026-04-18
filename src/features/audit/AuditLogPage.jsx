import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import { formatDateTime } from '../../lib/format';
import { supabase } from '../../lib/supabase';

async function getAuditLogs() {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id,action,entity_type,entity_id,details,created_at,profiles(full_name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export default function AuditLogPage() {
  const { data: rows = [], isLoading: loading, error } = useQuery({ queryKey: ['audit-logs'], queryFn: getAuditLogs });

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader title="سجل العمليات" subtitle="متابعة العمليات الحساسة داخل النظام" />
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error.message || 'تعذر تحميل السجل'}</div> : null}

      <SectionCard title="سجل التدقيق" subtitle="آخر العمليات الإدارية والمالية المسجلة">
        {loading ? (
          <div className="text-slate-500">جاري التحميل...</div>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={row.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-slate-950">{row.entity_type}</strong>
                      <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white">{row.action}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{row.profiles?.full_name || '-'} • {formatDateTime(row.created_at)}</p>
                  </div>
                </div>
                <pre className="mt-4 overflow-x-auto rounded-2xl bg-white p-3 text-xs text-slate-600 ring-1 ring-slate-100">{JSON.stringify(row.details, null, 2)}</pre>
              </div>
            ))}
            {rows.length === 0 ? <p className="text-slate-500">لا توجد سجلات بعد</p> : null}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
