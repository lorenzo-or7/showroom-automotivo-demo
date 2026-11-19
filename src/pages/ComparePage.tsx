import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { getVehicle } from '../data/vehicles';
import { useCompare } from '../hooks/useCompare';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { buildCompareRows } from '../lib/compare';
import { imageUrl } from '../lib/image';
import { Icon } from '../components/Icon';
import styles from './ComparePage.module.css';

export default function ComparePage() {
  useDocumentTitle('Comparador');
  const { ids, remove, clear, limit } = useCompare();
  const [onlyDiff, setOnlyDiff] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const vehicles = useMemo(() => ids.map((id) => getVehicle(id)).filter((v) => !!v), [ids]);
  const rows = useMemo(() => buildCompareRows(vehicles), [vehicles]);
  const visibleRows = onlyDiff ? rows.filter((r) => r.differs) : rows;
  const canAdd = vehicles.length < limit;

  return (
    <motion.section className={styles.page} initial={{ opacity: 0 }} animate={{ opacity: 1 }} aria-labelledby="compare-title">
      <div className="container">
        <Link to="/#estoque" className={styles.back}>
          <Icon name="arrow-left" size={18} />
          Voltar ao estoque
        </Link>

        <header className={styles.header}>
          <h1 id="compare-title" className={`display ${styles.title}`}>
            Lado a lado
          </h1>
          <p className={styles.intro}>
            Compare até {limit} veículos. As marcações apontam diferenças objetivas entre os dados; a escolha é sua.
          </p>
        </header>

        {vehicles.length === 0 ? (
          <div className={styles.empty}>
            <p className={`display ${styles.emptyTitle}`}>Nenhum veículo selecionado.</p>
            <p className={styles.muted}>Use o botão “Comparar” nos cards da coleção para escolher até {limit} modelos.</p>
            <Link to="/#estoque" className="btn btn--primary">
              Escolher na coleção
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.toolbar}>
              <label className={styles.toggle}>
                <input type="checkbox" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} disabled={vehicles.length < 2} />
                <span>Mostrar só o que difere</span>
              </label>
              <p className={styles.muted} aria-live="polite">
                {vehicles.length < 2
                  ? 'Adicione pelo menos mais um veículo para comparar.'
                  : `${rows.filter((r) => r.differs).length} de ${rows.length} itens diferem.`}
              </p>
              <button type="button" className={styles.clear} onClick={clear}>
                Limpar seleção
              </button>
            </div>

            <div ref={scrollerRef} className={styles.scroller} role="region" aria-label="Tabela de comparação. Role horizontalmente em telas pequenas." tabIndex={0}>
              <table className={styles.table} style={{ ['--cols' as string]: vehicles.length + (canAdd ? 1 : 0) }}>
                <caption className="visually-hidden">Comparação de {vehicles.length} veículos</caption>
                <thead>
                  <tr>
                    <td className={styles.corner} />
                      {vehicles.map((v) => (
                        <th key={v.id} scope="col" className={styles.head}>
                          <div className={styles.headMedia}>
                            <img
                              src={imageUrl(v.images[0].id, { width: 640, height: 440, quality: 65 })}
                              alt=""
                              width={640}
                              height={440}
                              loading="lazy"
                              style={{ objectPosition: v.images[0].focus }}
                            />
                          </div>
                          <span className={styles.headBrand}>{v.brand}</span>
                          <span className={styles.headName}>
                            {v.model} {v.version}
                          </span>
                          <span className={styles.headActions}>
                            <Link to={`/veiculo/${v.id}`} className={styles.headLink}>
                              Ver ficha{' '}<span className="visually-hidden">do {v.brand} {v.model}</span>
                            </Link>
                            <button
                              type="button"
                              className={styles.remove}
                              onClick={() => {
                                remove(v.id);
                                scrollerRef.current?.focus();
                              }}
                            >
                              Remover{' '}<span className="visually-hidden">{v.brand} {v.model}</span>
                            </button>
                          </span>
                        </th>
                      ))}
                    {canAdd && (
                      <td className={styles.addCell}>
                        <Link to="/#estoque" className={styles.add}>
                          <Icon name="plus" />
                          Adicionar veículo
                        </Link>
                      </td>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.key} data-differs={vehicles.length > 1 && row.differs ? '' : undefined}>
                      <th scope="row" className={styles.rowHead}>
                        {row.label}
                        {vehicles.length > 1 && row.differs && <span className={styles.diffTag}>difere</span>}
                      </th>
                      {row.values.map((value, i) => (
                        <td key={vehicles[i].id} className={styles.cell}>
                          <span>{value}</span>
                          {row.notes[i] && <span className={styles.note}>{row.notes[i]}</span>}
                        </td>
                      ))}
                      {canAdd && <td className={styles.cellEmpty} aria-hidden="true" />}
                    </tr>
                  ))}
                  {!onlyDiff && (
                    <tr>
                      <th scope="row" className={styles.rowHead}>
                        Destaques
                      </th>
                      {vehicles.map((v) => (
                        <td key={v.id} className={styles.cell}>
                          <ul className={styles.features}>
                            {v.features.map((f) => (
                              <li key={f}>{f}</li>
                            ))}
                          </ul>
                        </td>
                      ))}
                      {canAdd && <td className={styles.cellEmpty} aria-hidden="true" />}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className={styles.footnote}>Preços e quilometragens ilustrativos. Fichas técnicas com valores de referência do modelo.</p>
          </>
        )}
      </div>
    </motion.section>
  );
}
