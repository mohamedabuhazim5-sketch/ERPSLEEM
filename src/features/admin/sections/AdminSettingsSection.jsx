
import { useEffect, useState } from 'react';
import AdminMiniStat from '../components/AdminMiniStat';
import SettingsPage from '../../settings/SettingsPage';
import { getSettings } from '../../settings/settings.service';

export default function AdminSettingsSection() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSettings().then(setSettings).catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <AdminMiniStat label="اسم الشركة" value={settings?.company_name || '-'} hint="الاسم الظاهر في النظام" />
        <AdminMiniStat label="العملة" value={settings?.currency || '-'} hint="العملة الافتراضية" />
        <AdminMiniStat label="الضريبة" value={`${Number(settings?.tax_rate || 0)}%`} hint={settings?.tax_enabled ? 'مفعلة' : 'غير مفعلة'} />
        <AdminMiniStat label="حد التنبيه" value={settings?.low_stock_threshold || 0} hint="تنبيه انخفاض المخزون" />
      </div>
      <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm">
        <SettingsPage embedded />
      </div>
    </div>
  );
}
