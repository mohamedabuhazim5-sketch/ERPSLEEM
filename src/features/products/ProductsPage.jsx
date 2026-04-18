import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import TableSearchBar from '../../components/ui/TableSearchBar';
import SectionCard from '../../components/ui/SectionCard';
import ActionButton from '../../components/ui/ActionButton';
import EmptyState from '../../components/ui/EmptyState';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency } from '../../lib/format';
import { queryKeys } from '../../lib/queryKeys';
import ProductForm from './ProductForm';
import { activateProduct, createProduct, deactivateProduct, getProducts, updateProduct } from './products.service';

export default function ProductsPage({ embedded = false }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');

  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.products,
    queryFn: getProducts,
  });

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.products }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardCounts }),
      queryClient.invalidateQueries({ queryKey: queryKeys.reportsSummary }),
      queryClient.invalidateQueries({ queryKey: queryKeys.salesOptions }),
      queryClient.invalidateQueries({ queryKey: queryKeys.purchasesOptions }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      setShowForm(false);
      setEditingProduct(null);
      setError('');
      await invalidateAll();
    },
    onError: (err) => setError(err.message || 'تعذر حفظ المنتج'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }) => updateProduct(id, values),
    onSuccess: async () => {
      setShowForm(false);
      setEditingProduct(null);
      setError('');
      await invalidateAll();
    },
    onError: (err) => setError(err.message || 'تعذر تعديل المنتج'),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateProduct,
    onSuccess: invalidateAll,
    onError: (err) => setError(err.message || 'تعذر إيقاف المنتج'),
  });


  const activateMutation = useMutation({
    mutationFn: activateProduct,
    onSuccess: invalidateAll,
    onError: (err) => setError(err.message || 'تعذر تشغيل المنتج'),
  });

  function handleSubmit(values) {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, values });
    } else {
      createMutation.mutate(values);
    }
  }

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch =
          product.name?.toLowerCase().includes(search.toLowerCase()) ||
          product.sku?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
          statusFilter === '' ? true : statusFilter === 'active' ? product.is_active : !product.is_active;

        return matchesSearch && matchesStatus;
      }),
    [products, search, statusFilter]
  );

  const stats = useMemo(
    () => ({
      total: products.length,
      active: products.filter((p) => p.is_active).length,
      low: products.filter((p) => Number(p.stock_qty || 0) <= Number(p.min_stock || 0)).length,
      stockValue: products.reduce(
        (sum, p) => sum + Number(p.purchase_price || 0) * Number(p.stock_qty || 0),
        0
      ),
    }),
    [products]
  );

  const saving = createMutation.isPending || updateMutation.isPending;


  const embeddedActions = embedded ? (
    <div className="flex justify-end">
      <ActionButton
        onClick={() => {
          setEditingProduct(null);
          setShowForm((v) => !v);
        }}
        variant={showForm ? 'secondary' : 'primary'}
      >
        {showForm ? 'إغلاق النموذج' : 'إضافة صنف جديد'}
      </ActionButton>
    </div>
  ) : null;

  return (
    <div className="space-y-6" dir="rtl">
      {!embedded ? (
        <PageHeader
          title="الأصناف"
          subtitle="إدارة المنتجات والأسعار والمخزون بصورة موحدة"
          actions={
            <ActionButton
              onClick={() => {
                setEditingProduct(null);
                setShowForm((v) => !v);
              }}
              variant={showForm ? 'secondary' : 'primary'}
            >
              {showForm ? 'إغلاق النموذج' : 'إضافة صنف جديد'}
            </ActionButton>
          }
        />
      ) : null}

      {embeddedActions}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="إجمالي الأصناف" value={stats.total} />
        <StatCard title="الأصناف النشطة" value={stats.active} />
        <StatCard title="منخفضة المخزون" value={stats.low} />
        <StatCard title="قيمة المخزون" value={formatCurrency(stats.stockValue)} />
      </div>

      <TableSearchBar
        search={search}
        onSearchChange={setSearch}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        placeholder="ابحث باسم المنتج أو الكود"
        filterOptions={[
          { value: 'active', label: 'نشط' },
          { value: 'inactive', label: 'موقوف' },
        ]}
      />

      {showForm ? (
        <SectionCard title={editingProduct ? 'تعديل صنف' : 'إضافة صنف'} subtitle="أدخل البيانات الأساسية ثم احفظ">
          <ProductForm onSubmit={handleSubmit} loading={saving} initialData={editingProduct} />
        </SectionCard>
      ) : null}

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}

      <SectionCard title="قائمة الأصناف" subtitle="آخر الأصناف المضافة مع حالة النشاط والمخزون">
        {loading ? (
          <div className="text-slate-500">جاري تحميل الأصناف...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/80 text-slate-600">
                <tr>
                  <th className="p-4 text-right">الصورة</th>
                  <th className="p-4 text-right">الاسم</th>
                  <th className="p-4 text-right">الكود</th>
                  <th className="p-4 text-right">سعر الشراء</th>
                  <th className="p-4 text-right">سعر البيع</th>
                  <th className="p-4 text-right">الربح</th>
                  <th className="p-4 text-right">المخزون</th>
                  <th className="p-4 text-right">الحالة</th>
                  <th className="p-4 text-right">العمليات</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const profit = Number(product.sale_price || 0) - Number(product.purchase_price || 0);
                  return (
                    <tr key={product.id} className="border-t border-slate-100">
                      <td className="p-4">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="h-14 w-14 rounded-2xl border border-slate-200 object-cover" />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xs text-slate-400">بدون</div>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-slate-900">{product.name}</td>
                      <td className="p-4 text-slate-500">{product.sku || '-'}</td>
                      <td className="p-4">{formatCurrency(product.purchase_price)}</td>
                      <td className="p-4">{formatCurrency(product.sale_price)}</td>
                      <td className="p-4 font-semibold text-emerald-700">{formatCurrency(profit)}</td>
                      <td className="p-4">{product.stock_qty}</td>
                      <td className="p-4"><StatusBadge value={product.is_active ? 'active' : 'inactive'} label={product.is_active ? 'نشط' : 'موقوف'} /></td>
                      <td className="p-4">
                        <div className="flex gap-3">
                          <ActionButton variant="secondary" onClick={() => { setEditingProduct(product); setShowForm(true); }} className="px-3 py-2 text-blue-700">تعديل</ActionButton>
                          <ActionButton
                            variant="success"
                            onClick={() => activateMutation.mutate(product.id)}
                            className="px-3 py-2"
                            disabled={product.is_active || activateMutation.isPending}
                          >
                            تشغيل
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            onClick={() => deactivateMutation.mutate(product.id)}
                            className="px-3 py-2"
                            disabled={!product.is_active || deactivateMutation.isPending}
                          >
                            إيقاف
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 ? (
                  <tr><td colSpan="9" className="p-6"><EmptyState title="لا توجد أصناف مطابقة" description="جرّب تعديل كلمة البحث أو الفلاتر الحالية." /></td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
