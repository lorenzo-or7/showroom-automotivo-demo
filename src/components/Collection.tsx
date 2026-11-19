import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useCatalogFilters } from '../hooks/useCatalogFilters';
import { useDialog } from '../hooks/useDialog';
import { useCompare } from '../hooks/useCompare';
import { countActiveFilters, sortOptions, type SortKey } from '../lib/filters';
import { CategoryChips, FilterSelects } from './FilterFields';
import { Icon } from './Icon';
import { SplitReveal } from './SplitReveal';
import { VehicleCard, type CardSlot } from './VehicleCard';
import styles from './Collection.module.css';

const pattern: CardSlot[] = ['wide', 'tall', 'standard', 'standard', 'standard', 'tall', 'wide'];

export function Collection() {
  const { filters, results, update, reset, total } = useCatalogFilters();
  const compare = useCompare();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const active = countActiveFilters(filters);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(''), 4000);
    return () => window.clearTimeout(t);
  }, [notice]);

  const onCompareFull = useCallback(
    () => setNotice(`O comparador aceita até ${compare.limit} veículos. Remova um para incluir outro.`),
    [compare.limit],
  );

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <section id="estoque" className={styles.section} aria-labelledby="estoque-title">
      <div className="container">
        <header className={styles.header}>
          <SplitReveal as="h2" className={`display ${styles.title}`} lines={['A coleção']} inView />
          <p className={styles.intro}>
            Dez carros escolhidos pela história, pelo estado e pelo prazer de dirigir. Preços e quilometragens desta
            demonstração são ilustrativos.
          </p>
        </header>

        <div className={styles.toolbar} role="search" aria-label="Filtrar estoque">
          <div className={styles.searchRow}>
            <div className={styles.search}>
              <label htmlFor="busca" className="visually-hidden">
                Buscar por marca, modelo ou ano
              </label>
              <Icon name="search" className={styles.searchIcon} />
              <input
                id="busca"
                type="search"
                className="input"
                placeholder="Buscar por marca, modelo ou ano"
                value={filters.query}
                maxLength={80}
                autoComplete="off"
                onChange={(e) => update({ query: e.target.value })}
              />
            </div>

            <button
              type="button"
              className={`btn btn--small ${styles.drawerBtn}`}
              onClick={() => setDrawerOpen(true)}
              aria-haspopup="dialog"
            >
              <Icon name="sliders" size={18} />
              Filtros{active > 0 && <span className={styles.badge}>{active}</span>}
            </button>

            <div className={`field ${styles.sort}`}>
              <label className="visually-hidden" htmlFor="ordem">
                Ordenar por
              </label>
              <select
                id="ordem"
                className="select"
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value as SortKey })}
              >
                {sortOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.inlineFilters}>
            <FilterSelects filters={filters} update={update} idPrefix="f" />
          </div>

          <div className={styles.summaryRow}>
            <div className={styles.inlineChips}>
              <CategoryChips filters={filters} update={update} idPrefix="f" />
            </div>
            <div className={styles.status}>
              <p aria-live="polite" className={styles.count}>
                <strong className="tabular">{results.length}</strong> de {total} veículos
              </p>
              {active > 0 && (
                <button type="button" className={styles.clear} onClick={reset}>
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        </div>

        <p className={styles.notice} role="status" aria-live="polite">
          {notice}
        </p>

        {results.length > 0 ? (
          <LayoutGroup>
            <motion.ul className={styles.grid} layout>
              <AnimatePresence mode="popLayout" initial={false}>
                {results.map((v, i) => (
                  <motion.li key={v.id} layout="position" className={styles.cell} data-slot={pattern[i % pattern.length]}>
                    <VehicleCard
                      vehicle={v}
                      slot={pattern[i % pattern.length]}
                      eager={i < 2}
                      onCompareFull={onCompareFull}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          </LayoutGroup>
        ) : (
          <div className={styles.empty}>
            <p className={`display ${styles.emptyTitle}`}>Nada por aqui com esses filtros.</p>
            <p className={styles.emptyText}>
              {filters.query
                ? `Nenhum veículo corresponde a “${filters.query}” com os filtros escolhidos.`
                : 'Tente ampliar a faixa de preço, o ano ou a categoria.'}
            </p>
            <div className={styles.emptyActions}>
              {filters.query && (
                <button type="button" className="btn" onClick={() => update({ query: '' })}>
                  Remover busca
                </button>
              )}
              <button type="button" className="btn btn--primary" onClick={reset}>
                Limpar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <FilterDrawer onClose={closeDrawer} resultCount={results.length} active={active} onReset={reset}>
            <CategoryChips filters={filters} update={update} idPrefix="d" />
            <FilterSelects filters={filters} update={update} idPrefix="d" />
          </FilterDrawer>
        )}
      </AnimatePresence>
    </section>
  );
}

interface FilterDrawerProps {
  onClose: () => void;
  onReset: () => void;
  resultCount: number;
  active: number;
  children: React.ReactNode;
}

function FilterDrawer({ onClose, onReset, resultCount, active, children }: FilterDrawerProps) {
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref, true, onClose);

  return (
    <div className={styles.drawerRoot}>
      <motion.div
        className={styles.backdrop}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-hidden="true"
      />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={styles.drawer}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 40 }}
      >
        <div className={styles.drawerHead}>
          <h2 id="drawer-title" className={styles.drawerTitle}>
            Filtros
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar filtros">
            <Icon name="close" />
          </button>
        </div>
        <div className={styles.drawerBody}>{children}</div>
        <div className={styles.drawerFoot}>
          <button type="button" className="btn" onClick={onReset} disabled={active === 0}>
            Limpar
          </button>
          <button type="button" className="btn btn--primary" onClick={onClose}>
            {resultCount === 1 ? 'Ver 1 resultado' : `Ver ${resultCount} resultados`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
