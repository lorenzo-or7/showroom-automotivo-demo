import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { brands, inventory } from '../data/inventory';
import { applyFilters, emptyFilters, filtersFromParams, filtersToParams, type FilterState } from '../lib/filters';

/** Estado dos filtros com a URL como fonte única da verdade (links compartilháveis). */
export function useCatalogFilters() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => filtersFromParams(params, brands), [params]);
  const results = useMemo(() => applyFilters([...inventory], filters), [filters]);

  const update = useCallback(
    (patch: Partial<FilterState>) => {
      setParams((prev) => filtersToParams({ ...filtersFromParams(prev, brands), ...patch }, prev), {
        replace: true,
        preventScrollReset: true,
      });
    },
    [setParams],
  );

  const reset = useCallback(() => {
    setParams((prev) => filtersToParams(emptyFilters, prev), { replace: true, preventScrollReset: true });
  }, [setParams]);

  return { filters, results, update, reset, total: inventory.length };
}
