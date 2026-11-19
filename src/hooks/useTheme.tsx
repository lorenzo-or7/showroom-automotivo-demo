import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { site } from '../config/site';

export type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readInitial(): Theme {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function apply(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#F5F5F2' : '#101214');
  try {
    localStorage.setItem(site.storageKeys.theme, theme);
  } catch {
    /* armazenamento indisponível: a preferência vale só nesta sessão */
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitial);

  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const commit = () => {
      flushSync(() => setTheme(next));
      apply(next);
    };
    // View Transitions: troca de tema com fade sem flicker. Fallback: transição CSS das cores.
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (!reduce && typeof doc.startViewTransition === 'function') {
      doc.startViewTransition(commit);
    } else {
      document.documentElement.classList.add('theme-switching');
      commit();
      window.setTimeout(() => document.documentElement.classList.remove('theme-switching'), 400);
    }
  }, [theme]);

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme precisa estar dentro de ThemeProvider');
  return ctx;
}
