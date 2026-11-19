import { categoryLabels, type Category, type Transmission } from '../data/types';
import { brands, years } from '../data/inventory';
import { priceRanges, type FilterState } from '../lib/filters';
import styles from './Collection.module.css';

interface FilterFieldsProps {
  filters: FilterState;
  update: (patch: Partial<FilterState>) => void;
  idPrefix: string;
}

const categories = Object.entries(categoryLabels) as [Category, string][];

export function CategoryChips({ filters, update, idPrefix }: FilterFieldsProps) {
  return (
    <fieldset className={styles.chips}>
      <legend className="visually-hidden">Categoria</legend>
      {[['', 'Todas'] as const, ...categories].map(([id, label]) => (
        <label key={id || 'todas'} className={styles.chip}>
          <input
            type="radio"
            name={`${idPrefix}-categoria`}
            value={id}
            checked={filters.category === id}
            onChange={() => update({ category: id as Category | '' })}
          />
          <span>{label}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function FilterSelects({ filters, update, idPrefix }: FilterFieldsProps) {
  return (
    <>
      <div className="field">
        <label className="field__label" htmlFor={`${idPrefix}-marca`}>
          Marca
        </label>
        <select
          id={`${idPrefix}-marca`}
          className="select"
          value={filters.brand}
          onChange={(e) => update({ brand: e.target.value })}
        >
          <option value="">Todas as marcas</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field__label" htmlFor={`${idPrefix}-preco`}>
          Faixa de preço
        </label>
        <select
          id={`${idPrefix}-preco`}
          className="select"
          value={filters.price}
          onChange={(e) => update({ price: e.target.value })}
        >
          <option value="">Qualquer valor</option>
          {priceRanges.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field__label" htmlFor={`${idPrefix}-ano`}>
          Ano a partir de
        </label>
        <select
          id={`${idPrefix}-ano`}
          className="select"
          value={filters.minYear || ''}
          onChange={(e) => update({ minYear: Number(e.target.value) || 0 })}
        >
          <option value="">Qualquer ano</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field__label" htmlFor={`${idPrefix}-cambio`}>
          Câmbio
        </label>
        <select
          id={`${idPrefix}-cambio`}
          className="select"
          value={filters.transmission}
          onChange={(e) => update({ transmission: e.target.value as Transmission | '' })}
        >
          <option value="">Automático ou manual</option>
          <option value="Automática">Automático</option>
          <option value="Manual">Manual</option>
        </select>
      </div>
    </>
  );
}
