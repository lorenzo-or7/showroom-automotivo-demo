import type { Category, Transmission, Vehicle } from '../data/types';

export type SortKey = 'curadoria' | 'preco-asc' | 'preco-desc' | 'ano-desc' | 'km-asc';

export interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const priceRanges: PriceRange[] = [
  { id: 'ate-400', label: 'Até R$ 400 mil', min: 0, max: 400_000 },
  { id: '400-800', label: 'R$ 400 mil a R$ 800 mil', min: 400_000, max: 800_000 },
  { id: '800-1200', label: 'R$ 800 mil a R$ 1,2 mi', min: 800_000, max: 1_200_000 },
  { id: 'acima-1200', label: 'Acima de R$ 1,2 mi', min: 1_200_000, max: Number.POSITIVE_INFINITY },
];

export const sortOptions: { id: SortKey; label: string }[] = [
  { id: 'curadoria', label: 'Curadoria' },
  { id: 'preco-asc', label: 'Menor preço' },
  { id: 'preco-desc', label: 'Maior preço' },
  { id: 'ano-desc', label: 'Mais novos' },
  { id: 'km-asc', label: 'Menos rodados' },
];

export interface FilterState {
  query: string;
  brand: string;
  category: Category | '';
  price: string;
  /** Ano mínimo. 0 = qualquer. */
  minYear: number;
  transmission: Transmission | '';
  sort: SortKey;
}

export const emptyFilters: FilterState = {
  query: '',
  brand: '',
  category: '',
  price: '',
  minYear: 0,
  transmission: '',
  sort: 'curadoria',
};

/** Remove acentos e normaliza para comparação textual. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function matchesQuery(v: Vehicle, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  const haystack = normalize(
    [v.brand, v.model, v.version, String(v.year), v.fuel, v.transmission, v.body, v.color, v.engine].join(' '),
  );
  return q.split(/\s+/).every((term) => haystack.includes(term));
}

export function applyFilters(list: Vehicle[], f: FilterState): Vehicle[] {
  const range = priceRanges.find((r) => r.id === f.price);
  const result = list.filter((v) => {
    if (f.brand && v.brand !== f.brand) return false;
    if (f.category && v.category !== f.category) return false;
    if (range && (v.price < range.min || v.price >= range.max)) return false;
    if (f.minYear && v.year < f.minYear) return false;
    if (f.transmission && v.transmission !== f.transmission) return false;
    return matchesQuery(v, f.query);
  });
  return sortVehicles(result, f.sort);
}

export function sortVehicles(list: Vehicle[], sort: SortKey): Vehicle[] {
  const copy = [...list];
  switch (sort) {
    case 'preco-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'preco-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'ano-desc':
      return copy.sort((a, b) => b.year - a.year || a.curation - b.curation);
    case 'km-asc':
      return copy.sort((a, b) => a.mileage - b.mileage);
    default:
      return copy.sort((a, b) => a.curation - b.curation);
  }
}

export function countActiveFilters(f: FilterState): number {
  return [f.query.trim(), f.brand, f.category, f.price, f.minYear, f.transmission].filter(Boolean).length;
}

/* ---------- Sincronização com a URL ---------- */

const PARAM = {
  query: 'q',
  brand: 'marca',
  category: 'categoria',
  price: 'preco',
  minYear: 'ano',
  transmission: 'cambio',
  sort: 'ordem',
} as const;

const transmissionParam: Record<Transmission, string> = { Automática: 'automatica', Manual: 'manual' };

export function filtersFromParams(params: URLSearchParams, validBrands: string[]): FilterState {
  const brand = params.get(PARAM.brand) ?? '';
  const category = params.get(PARAM.category) ?? '';
  const price = params.get(PARAM.price) ?? '';
  const year = Number(params.get(PARAM.minYear) ?? 0);
  const trans = params.get(PARAM.transmission);
  const sort = params.get(PARAM.sort) ?? '';
  const validCategories: Category[] = ['esportivos', 'sedas', 'suvs', 'peruas', 'classicos'];

  return {
    query: (params.get(PARAM.query) ?? '').slice(0, 80),
    brand: validBrands.includes(brand) ? brand : '',
    category: validCategories.includes(category as Category) ? (category as Category) : '',
    price: priceRanges.some((r) => r.id === price) ? price : '',
    minYear: Number.isInteger(year) && year > 1900 && year < 2100 ? year : 0,
    transmission: trans === 'manual' ? 'Manual' : trans === 'automatica' ? 'Automática' : '',
    sort: sortOptions.some((o) => o.id === sort) ? (sort as SortKey) : 'curadoria',
  };
}

/** Escreve os filtros na URL preservando parâmetros não relacionados. */
export function filtersToParams(f: FilterState, base?: URLSearchParams): URLSearchParams {
  const params = new URLSearchParams(base);
  Object.values(PARAM).forEach((key) => params.delete(key));
  if (f.query.trim()) params.set(PARAM.query, f.query.trim());
  if (f.brand) params.set(PARAM.brand, f.brand);
  if (f.category) params.set(PARAM.category, f.category);
  if (f.price) params.set(PARAM.price, f.price);
  if (f.minYear) params.set(PARAM.minYear, String(f.minYear));
  if (f.transmission) params.set(PARAM.transmission, transmissionParam[f.transmission]);
  if (f.sort !== 'curadoria') params.set(PARAM.sort, f.sort);
  return params;
}
