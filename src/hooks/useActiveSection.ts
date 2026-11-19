import { useEffect, useState } from 'react';

/** Devolve o id da seção que ocupa a faixa central da viewport. */
export function useActiveSection(ids: readonly string[], enabled = true): string {
  const [active, setActive] = useState('');

  useEffect(() => {
    if (!enabled) return;
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;

    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting));
        const current = ids.find((id) => visible.get(id));
        setActive(current ?? '');
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, enabled]);

  return enabled ? active : '';
}
