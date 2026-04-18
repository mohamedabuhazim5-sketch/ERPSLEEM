import { useEffect, useState } from 'react';
import ActionButton from '../../components/ui/ActionButton';
import FormInput from '../../components/form/FormInput';
import FormTextarea from '../../components/form/FormTextarea';

const initialValues = {
  name: '',
  phone: '',
  address: '',
  notes: '',
};

export default function CustomerForm({ initialData, onSubmit, loading }) {
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    setValues(initialData ? { ...initialValues, ...initialData } : initialValues);
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function submit(e) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
      <FormInput label="اسم العميل" name="name" value={values.name} onChange={handleChange} placeholder="اسم العميل" />
      <FormInput label="رقم الهاتف" name="phone" value={values.phone} onChange={handleChange} placeholder="رقم الهاتف" />
      <FormInput label="العنوان" name="address" value={values.address} onChange={handleChange} placeholder="العنوان" containerClassName="md:col-span-2" />
      <FormTextarea label="ملاحظات" name="notes" value={values.notes} onChange={handleChange} placeholder="ملاحظات" containerClassName="md:col-span-2" />
      <div className="md:col-span-2">
        <ActionButton type="submit" disabled={loading}>
          {loading ? 'جاري الحفظ...' : 'حفظ العميل'}
        </ActionButton>
      </div>
    </form>
  );
}
