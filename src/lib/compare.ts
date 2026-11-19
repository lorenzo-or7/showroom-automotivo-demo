import type { Vehicle } from '../data/types';
import { formatAcceleration, formatMileage, formatPrice } from './format';

export interface CompareRow {
  key: string;
  label: string;
  values: string[];
  /** Notas neutras por célula (ex.: "menor valor"). Nunca declaram vencedor. */
  notes: (string | null)[];
  differs: boolean;
}

type Extreme = 'min' | 'max';

function notesFor(vehicles: Vehicle[], pick: (v: Vehicle) => number | null, extreme: Extreme, label: string): (string | null)[] {
  const nums = vehicles.map(pick);
  const valid = nums.filter((n): n is number => n !== null);
  if (vehicles.length < 2 || valid.length < 2) return vehicles.map(() => null);
  const target = extreme === 'min' ? Math.min(...valid) : Math.max(...valid);
  const unique = new Set(valid).size > 1;
  return nums.map((n) => (unique && n === target ? label : null));
}

export function buildCompareRows(vehicles: Vehicle[]): CompareRow[] {
  const row = (
    key: string,
    label: string,
    format: (v: Vehicle) => string,
    notes?: (string | null)[],
  ): CompareRow => {
    const values = vehicles.map(format);
    return {
      key,
      label,
      values,
      notes: notes ?? vehicles.map(() => null),
      differs: new Set(values).size > 1,
    };
  };

  return [
    row('price', 'Preço ilustrativo', (v) => formatPrice(v.price), notesFor(vehicles, (v) => v.price, 'min', 'Menor valor')),
    row('year', 'Ano', (v) => String(v.year), notesFor(vehicles, (v) => v.year, 'max', 'Mais recente')),
    row('mileage', 'Quilometragem', (v) => formatMileage(v.mileage), notesFor(vehicles, (v) => v.mileage, 'min', 'Menos rodado')),
    row('transmission', 'Câmbio', (v) => v.transmission),
    row('fuel', 'Combustível', (v) => v.fuel),
    row('body', 'Carroceria', (v) => v.body),
    row('power', 'Potência', (v) => `${v.power} cv`, notesFor(vehicles, (v) => v.power, 'max', 'Mais potente')),
    row('acceleration', '0 a 100 km/h', (v) => formatAcceleration(v.acceleration), notesFor(vehicles, (v) => v.acceleration, 'min', 'Menor tempo')),
    row('engine', 'Motor', (v) => v.engine),
    row('drivetrain', 'Tração', (v) => v.drivetrain),
    row('seats', 'Lugares', (v) => String(v.seats)),
  ];
}
