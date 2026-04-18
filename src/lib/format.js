export function formatCurrency(value) {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('ar-EG');
}

export function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('ar-EG');
}
