export function formatCurrencyBRL(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function calculateDiscount(originalPrice: number, promoPrice?: number): number {
  if (!promoPrice || promoPrice >= originalPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - promoPrice) / originalPrice) * 100);
}

export function calculateInstallments(price: number, maxInstallments: number = 12): { count: number; value: number } {
  const safeCount = Math.min(maxInstallments, Math.max(1, Math.floor(price / 15)));
  const count = safeCount > 0 ? safeCount : 1;
  const value = price / count;
  return { count, value };
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
