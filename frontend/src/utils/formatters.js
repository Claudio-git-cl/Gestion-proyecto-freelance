export const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-ES');
};

export const formatStatus = (status) => {
  switch (status) {
    case 'Pagada':
      return { label: 'Pagada', color: 'success' };
    case 'Pendiente':
      return { label: 'Pendiente', color: 'warning' };
    case 'Vencida':
      return { label: 'Vencida', color: 'error' };
    case 'Anulada':
      return { label: 'Anulada', color: 'default' };
    case 'Borrador':
      return { label: 'Borrador', color: 'info' };
    default:
      return { label: status, color: 'default' };
  }
};