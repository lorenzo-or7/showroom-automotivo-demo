import type { Vehicle } from './types';
import { vehicles } from './vehicles';

/**
 * Ponto único de acesso ao estoque.
 * Hoje lê o catálogo estático; numa integração real, troque a implementação
 * por uma chamada à API de estoque/DMS e mantenha o contrato `Vehicle[]`.
 */
export const inventory: readonly Vehicle[] = vehicles;

export const brands: string[] = [...new Set(inventory.map((v) => v.brand))].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const years: number[] = [...new Set(inventory.map((v) => v.year))].sort((a, b) => b - a);

export function relatedVehicles(current: Vehicle, limit = 3): Vehicle[] {
  const sameCategory = inventory.filter((v) => v.id !== current.id && v.category === current.category);
  const others = inventory.filter((v) => v.id !== current.id && v.category !== current.category);
  return [...sameCategory, ...others].slice(0, limit);
}
