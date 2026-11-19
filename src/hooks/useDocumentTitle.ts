import { useEffect } from 'react';
import { site } from '../config/site';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title
      ? `${title} — ${site.brand.name}`
      : `${site.brand.name} — Showroom automotivo demonstrativo`;
  }, [title]);
}
