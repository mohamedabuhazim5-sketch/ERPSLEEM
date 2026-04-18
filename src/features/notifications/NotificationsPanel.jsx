import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { getNotifications, markNotificationRead } from './notifications.service';

export default function NotificationsPanel({ role }) {
  const queryClient = useQueryClient();
  const { data: rows = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.notifications(role),
    queryFn: () => getNotifications(role),
    enabled: Boolean(role),
  });

  const mutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications(role) }),
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold">الإشعارات</h2>
      {loading ? <p className="text-slate-500">جاري التحميل...</p> : null}
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded-xl border border-slate-100 p-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <strong>{row.title}</strong>
                <p className="mt-1 text-sm text-slate-600">{row.message}</p>
              </div>
              {!row.is_read ? (
                <button onClick={() => mutation.mutate(row.id)} className="text-sm text-blue-600">تم</button>
              ) : (
                <span className="text-xs text-slate-400">مقروء</span>
              )}
            </div>
          </div>
        ))}
        {!loading && rows.length === 0 ? <p className="text-slate-500">لا توجد إشعارات حاليًا.</p> : null}
      </div>
    </div>
  );
}
