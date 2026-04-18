import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import AdminProductsSection from './sections/AdminProductsSection';
import AdminCustomersSection from './sections/AdminCustomersSection';
import AdminSuppliersSection from './sections/AdminSuppliersSection';
import AdminSalesSection from './sections/AdminSalesSection';
import AdminPurchasesSection from './sections/AdminPurchasesSection';
import AdminExpensesSection from './sections/AdminExpensesSection';
import AdminUsersSection from './sections/AdminUsersSection';
import AdminSettingsSection from './sections/AdminSettingsSection';

const tabs = [
  { key: 'products', label: 'الأصناف', hint: 'إدارة الأسعار والمخزون' },
  { key: 'customers', label: 'العملاء', hint: 'إضافة وتعديل العملاء' },
  { key: 'suppliers', label: 'الموردين', hint: 'الموردون والمديونيات' },
  { key: 'sales', label: 'المبيعات', hint: 'فاتورة بيع سريعة' },
  { key: 'purchases', label: 'المشتريات', hint: 'الوارد وتكلفة الأصناف' },
  { key: 'expenses', label: 'المصروفات', hint: 'مصاريف النشاط' },
  { key: 'users', label: 'المستخدمين', hint: 'الأدوار والصلاحيات' },
  { key: 'settings', label: 'الإعدادات', hint: 'إعدادات الشركة والفواتير' },
];

export default function AdminControlCenterPage() {
  const [activeTab, setActiveTab] = useState('products');
  const currentTab = tabs.find((tab) => tab.key === activeTab);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-2xl">
        <PageHeader
          title="مركز التحكم"
          subtitle="واجهة إدارية سريعة تجمع الإضافة والتعديل والمتابعة اليومية في مكان واحد بدل التنقل بين الصفحات."
          actions={<div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100">{currentTab?.hint}</div>}
        />
      </div>

      <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-2xl border px-4 py-4 text-right transition ${
                activeTab === tab.key
                  ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="text-sm font-bold">{tab.label}</div>
              <div className={`mt-1 text-xs ${activeTab === tab.key ? 'text-slate-300' : 'text-slate-400'}`}>{tab.hint}</div>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'products' && <AdminProductsSection />}
      {activeTab === 'customers' && <AdminCustomersSection />}
      {activeTab === 'suppliers' && <AdminSuppliersSection />}
      {activeTab === 'sales' && <AdminSalesSection />}
      {activeTab === 'purchases' && <AdminPurchasesSection />}
      {activeTab === 'expenses' && <AdminExpensesSection />}
      {activeTab === 'users' && <AdminUsersSection />}
      {activeTab === 'settings' && <AdminSettingsSection />}
    </div>
  );
}
