import type { VehicleImage } from '../data/types';

const BASE = 'https://images.unsplash.com/photo-';

interface ImageUrlOptions {
  width: number;
  /** Altura opcional para recorte no CDN. */
  height?: number;
  quality?: number;
}

export function imageUrl(id: string, { width, height, quality = 70 }: ImageUrlOptions): string {
  const params = new URLSearchParams({ auto: 'format', fit: 'crop', w: String(width), q: String(quality) });
  if (height) params.set('h', String(height));
  return `${BASE}${id}?${params.toString()}`;
}

const DEFAULT_WIDTHS = [480, 828, 1280, 1920];

export function imageSrcSet(id: string, widths: number[] = DEFAULT_WIDTHS, quality?: number): string {
  return widths.map((w) => `${imageUrl(id, { width: w, quality })} ${w}w`).join(', ');
}

/** Atributos prontos para <img>, com dimensões explícitas para evitar layout shift. */
export function imgProps(
  image: VehicleImage,
  opts: { sizes: string; widths?: number[]; baseWidth?: number; quality?: number },
) {
  const baseWidth = opts.baseWidth ?? 1280;
  return {
    src: imageUrl(image.id, { width: baseWidth, quality: opts.quality }),
    srcSet: imageSrcSet(image.id, opts.widths, opts.quality),
    sizes: opts.sizes,
    alt: image.alt,
    width: baseWidth,
    height: Math.round(baseWidth / image.ratio),
  };
}
