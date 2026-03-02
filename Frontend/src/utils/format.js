export function formatCurrency(value, currency = 'USD') {
  if (typeof value !== 'number') return value;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}


export const parseArrayField = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};
