import { useEffect, useState } from 'react';
import ActionButton from '../../components/ui/ActionButton';
import FormInput from '../../components/form/FormInput';
import { uploadProductImage } from './product-image.service';

const initialValues = {
  name: '',
  sku: '',
  purchase_price: '',
  sale_price: '',
  stock_qty: '',
  min_stock: '',
  image_url: '',
};

export default function ProductForm({ onSubmit, loading, initialData }) {
  const [values, setValues] = useState(initialValues);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setValues(initialData ? { ...initialValues, ...initialData } : initialValues);
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadProductImage(file);
      setValues((prev) => ({ ...prev, image_url: imageUrl }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  function submit(e) {
    e.preventDefault();
    onSubmit({
      ...values,
      purchase_price: Number(values.purchase_price || 0),
      sale_price: Number(values.sale_price || 0),
      stock_qty: Number(values.stock_qty || 0),
      min_stock: Number(values.min_stock || 0),
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
      <FormInput label="اسم المنتج" name="name" value={values.name} onChange={handleChange} placeholder="اسم المنتج" />
      <FormInput label="كود المنتج" name="sku" value={values.sku} onChange={handleChange} placeholder="كود المنتج" />
      <FormInput label="سعر الشراء" name="purchase_price" value={values.purchase_price} onChange={handleChange} placeholder="سعر الشراء" type="number" />
      <FormInput label="سعر البيع" name="sale_price" value={values.sale_price} onChange={handleChange} placeholder="سعر البيع" type="number" />
      <FormInput label="المخزون" name="stock_qty" value={values.stock_qty} onChange={handleChange} placeholder="المخزون" type="number" />
      <FormInput label="حد التنبيه" name="min_stock" value={values.min_stock} onChange={handleChange} placeholder="حد التنبيه" type="number" />

      <div className="space-y-2 md:col-span-2">
        <label className="mb-2 block text-sm font-bold text-slate-700">صورة المنتج</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm" />
        {uploading ? <p className="text-sm text-slate-500">جاري رفع الصورة...</p> : null}
        {values.image_url ? (
          <img src={values.image_url} alt="preview" className="h-28 w-28 rounded-xl border border-slate-200 object-cover" />
        ) : null}
      </div>

      <div className="md:col-span-2">
        <ActionButton type="submit" disabled={loading || uploading}>
          {loading ? 'جاري الحفظ...' : 'حفظ المنتج'}
        </ActionButton>
      </div>
    </form>
  );
}
