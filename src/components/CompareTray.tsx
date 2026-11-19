import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { getVehicle } from '../data/vehicles';
import { useCompare } from '../hooks/useCompare';
import { imageUrl } from '../lib/image';
import { Icon } from './Icon';
import styles from './CompareTray.module.css';

/** Barra fixa com a seleção do comparador. Some na própria página de comparação. */
export function CompareTray() {
  const { ids, remove, clear, limit } = useCompare();
  const location = useLocation();
  const visible = ids.length > 0 && location.pathname !== '/comparar';
  const selected = ids.map((id) => getVehicle(id)).filter((v) => !!v);

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          className={styles.tray}
          aria-label="Comparador"
          initial={{ y: '120%' }}
          animate={{ y: 0 }}
          exit={{ y: '120%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        >
          <p className={styles.label}>
            <span className="tabular">{ids.length}</span> de {limit} no comparador
          </p>
          <ul className={styles.list}>
            <AnimatePresence initial={false}>
              {selected.map((v) => (
                <motion.li
                  key={v.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={styles.item}
                >
                  <img src={imageUrl(v.images[0].id, { width: 120, height: 90, quality: 55 })} alt="" width={60} height={45} />
                  <span className={styles.name}>{v.model}</span>
                  <button type="button" className={styles.remove} onClick={() => remove(v.id)} aria-label={`Remover ${v.brand} ${v.model} do comparador`}>
                    <Icon name="close" size={16} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <div className={styles.actions}>
            <button type="button" className={styles.clear} onClick={clear}>
              Limpar
            </button>
            {ids.length >= 2 ? (
              <Link to="/comparar" className="btn btn--primary btn--small">
                Comparar
              </Link>
            ) : (
              <span className={styles.hint}>Escolha mais um para comparar</span>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
