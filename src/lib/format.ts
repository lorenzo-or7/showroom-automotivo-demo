const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const integer = new Intl.NumberFormat('pt-BR');

export function formatPrice(value: number): string {
  return currency.format(value);
}

/** Versão curta para chips e filtros: R$ 1,2 mi / R$ 450 mil. */
export function formatPriceShort(value: number): string {
  if (value >= 1_000_000) {
    const mi = value / 1_000_000;
    return `R$ ${mi.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`;
  }
  return `R$ ${Math.round(value / 1000)} mil`;
}

export function formatMileage(value: number): string {
  return `${integer.format(value)} km`;
}

export function formatAcceleration(value: number | null): string {
  return value === null ? 'Sem dado de referência' : `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} s`;
}

export function formatDateBR(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

export function vehicleName(v: { brand: string; model: string }): string {
  return `${v.brand} ${v.model}`;
}

export function vehicleFullName(v: { brand: string; model: string; version: string; year: number }): string {
  return `${v.brand} ${v.model} ${v.version}, ${v.year}`;
}
