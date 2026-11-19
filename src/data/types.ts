export type Fuel = 'Gasolina' | 'Diesel' | 'Elétrico' | 'Híbrido plug-in';
export type Transmission = 'Automática' | 'Manual';
export type Category = 'esportivos' | 'sedas' | 'suvs' | 'peruas' | 'classicos';
export type Body = 'Cupê' | 'Sedã' | 'SUV' | 'Perua' | 'Roadster';

export interface VehicleImage {
  /** ID da fotografia no CDN do Unsplash (sem o prefixo `photo-`). */
  id: string;
  alt: string;
  /** Proporção largura/altura da foto original. */
  ratio: number;
  /** `object-position` usado quando a foto é recortada. */
  focus?: string;
}

export interface SpecItem {
  label: string;
  value: string;
}

export interface Vehicle {
  /** Identificador estável, usado na URL e no comparador. */
  id: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  /** Preço ilustrativo em reais. */
  price: number;
  /** Quilometragem ilustrativa. */
  mileage: number;
  fuel: Fuel;
  transmission: Transmission;
  category: Category;
  body: Body;
  color: string;
  /** Potência em cv (referência). */
  power: number;
  /** 0–100 km/h em segundos (referência). `null` quando não há dado de referência. */
  acceleration: number | null;
  drivetrain: string;
  seats: number;
  engine: string;
  /** Primeira imagem = capa. */
  images: VehicleImage[];
  summary: string;
  description: string;
  features: string[];
  /** Ordem de curadoria (menor = primeiro). */
  curation: number;
}

export const categoryLabels: Record<Category, string> = {
  esportivos: 'Esportivos',
  sedas: 'Sedãs',
  suvs: 'SUVs',
  peruas: 'Peruas',
  classicos: 'Clássicos',
};
