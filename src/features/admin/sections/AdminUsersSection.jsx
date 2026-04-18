
import { useEffect, useMemo, useState } from 'react';
import AdminMiniStat from '../components/AdminMiniStat';
import UsersPage from '../../users/UsersPage';
import { getUsers } from '../../users/users.service';

export default function AdminUsersSection() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getUsers().then(setRows).catch(console.error);
  }, []);

  const stats = useMemo(() => {
    const admins = rows.filter((row) => row.role === 'admin').length;
    const active = rows.filter((row) => row.is_active).length;
    const accountants = rows.filter((row) => row.role === 'accountant').length;
    return { admins, active, accountants };
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <AdminMiniStat label="إجمالي المستخدمين" value={rows.length} hint="كل الحسابات المسجلة" />
        <AdminMiniStat label="الحسابات النشطة" value={stats.active} hint={`${stats.admins} مدير`} />
        <AdminMiniStat label="الحسابات المحاسبية" value={stats.accountants} hint="مستخدمون بدور Accountant" />
      </div>
      <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm">
        <UsersPage embedded />
      </div>
    </div>
  );
}
