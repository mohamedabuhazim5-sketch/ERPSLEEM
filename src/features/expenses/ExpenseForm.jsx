import { useEffect, useState } from 'react';
import ActionButton from '../../components/ui/ActionButton';
import FormInput from '../../components/form/FormInput';
import FormTextarea from '../../components/form/FormTextarea';

const initialValues = {
  title: '',
  category: '',
  amount: '',
  expense_date: new Date().toISOString().slice(0, 10),
  notes: '',
};

export default function ExpenseForm({ initialData, onSubmit, loading }) {
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
    onSubmit({ ...values, amount: Number(values.amount || 0) });
  }

  return (
    <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
      <FormInput label="اسم المصروف" name="title" value={values.title} onChange={handleChange} placeholder="اسم المصروف" />
      <FormInput label="الفئة" name="category" value={values.category} onChange={handleChange} placeholder="الفئة" />
      <FormInput label="القيمة" name="amount" value={values.amount} onChange={handleChange} placeholder="القيمة" type="number" />
      <FormInput label="التاريخ" type="date" name="expense_date" value={values.expense_date} onChange={handleChange} />
      <FormTextarea label="ملاحظات" name="notes" value={values.notes} onChange={handleChange} placeholder="ملاحظات" containerClassName="md:col-span-2" />
      <div className="md:col-span-2">
        <ActionButton type="submit" disabled={loading}>
          {loading ? 'جاري الحفظ...' : 'حفظ المصروف'}
        </ActionButton>
      </div>
    </form>
  );
}
