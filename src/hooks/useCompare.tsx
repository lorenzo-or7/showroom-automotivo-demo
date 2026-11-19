import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { site } from '../config/site';
import { inventory } from '../data/inventory';

interface CompareContextValue {
  ids: string[];
  has: (id: string) => boolean;
  /** Retorna `false` quando o limite já foi atingido. */
  toggle: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
  isFull: boolean;
  limit: number;
}

const CompareContext = createContext<CompareContextValue | null>(null);
const validIds = new Set(inventory.map((v) => v.id));

function load(): string[] {
  try {
    const raw = localStorage.getItem(site.storageKeys.compare);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string' && validIds.has(id)).slice(0, site.compareLimit);
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(load);
  const limit = site.compareLimit;

  useEffect(() => {
    try {
      localStorage.setItem(site.storageKeys.compare, JSON.stringify(ids));
    } catch {
      /* ignora: persistência é opcional */
    }
  }, [ids]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (id: string) => {
      if (ids.includes(id)) {
        setIds((prev) => prev.filter((x) => x !== id));
        return true;
      }
      if (ids.length >= limit) return false;
      setIds((prev) => [...prev, id]);
      return true;
    },
    [ids, limit],
  );

  const remove = useCallback((id: string) => setIds((prev) => prev.filter((x) => x !== id)), []);
  const clear = useCallback(() => setIds([]), []);

  const value = useMemo(
    () => ({ ids, has, toggle, remove, clear, isFull: ids.length >= limit, limit }),
    [ids, has, toggle, remove, clear, limit],
  );
  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare precisa estar dentro de CompareProvider');
  return ctx;
}
