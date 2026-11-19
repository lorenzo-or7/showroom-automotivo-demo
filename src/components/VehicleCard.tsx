import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import type { Vehicle } from '../data/types';
import { useCompare } from '../hooks/useCompare';
import { formatMileage, formatPrice } from '../lib/format';
import { imgProps } from '../lib/image';
import { preloadVehiclePage } from '../lib/preload';
import { Icon } from './Icon';
import styles from './VehicleCard.module.css';

export type CardSlot = 'wide' | 'tall' | 'standard';

interface VehicleCardProps {
  vehicle: Vehicle;
  slot: CardSlot;
  /** Prioriza o carregamento das primeiras imagens visíveis. */
  eager?: boolean;
  onCompareFull?: () => void;
}

const sizesBySlot: Record<CardSlot, string> = {
  wide: '(min-width: 1100px) 66vw, (min-width: 700px) 100vw, 100vw',
  tall: '(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw',
  standard: '(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw',
};

export function VehicleCard({ vehicle: v, slot, eager = false, onCompareFull }: VehicleCardProps) {
  const location = useLocation();
  const compare = useCompare();
  const selected = compare.has(v.id);
  const cover = v.images[0];
  const titleId = `card-${v.id}`;

  const onCompare = () => {
    const ok = compare.toggle(v.id);
    if (!ok) onCompareFull?.();
  };

  return (
    <motion.article
      layout="position"
      className={styles.card}
      data-slot={slot}
      aria-labelledby={titleId}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onPointerEnter={preloadVehiclePage}
      onFocus={preloadVehiclePage}
    >
      <div className={styles.media}>
        <motion.div layoutId={`media-${v.id}`} className={styles.mediaInner}>
          <img
            {...imgProps(cover, { sizes: sizesBySlot[slot], widths: [480, 828, 1280, 1600], baseWidth: 1280 })}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            style={{ objectPosition: cover.focus }}
            className={styles.image}
          />
        </motion.div>
        {v.images.length > 1 && (
          <span className={styles.count} aria-hidden="true">
            {v.images.length} fotos
          </span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.heading}>
          <p className={styles.brand}>{v.brand}</p>
          <h3 id={titleId} className={styles.title}>
            <Link
              to={`/veiculo/${v.id}`}
              state={{ from: `${location.pathname}${location.search}` }}
              className={styles.link}
            >
              {v.model} <span className={styles.version}>{v.version}</span>
            </Link>
          </h3>
        </div>

        <dl className={styles.meta}>
          <div>
            <dt className="visually-hidden">Ano</dt>
            <dd>{v.year}</dd>
          </div>
          <div>
            <dt className="visually-hidden">Quilometragem</dt>
            <dd>{formatMileage(v.mileage)}</dd>
          </div>
          <div>
            <dt className="visually-hidden">Câmbio</dt>
            <dd>{v.transmission}</dd>
          </div>
          <div>
            <dt className="visually-hidden">Combustível</dt>
            <dd>{v.fuel}</dd>
          </div>
        </dl>

        <div className={styles.footer}>
          <p className={styles.price}>
            <span className="visually-hidden">Preço ilustrativo: </span>
            {formatPrice(v.price)}
          </p>
          <motion.button
            type="button"
            className={styles.compare}
            aria-pressed={selected}
            onClick={onCompare}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Icon name={selected ? 'check' : 'plus'} size={18} />
            <span>{selected ? 'No comparador' : 'Comparar'}</span>
            {' '}<span className="visually-hidden">{v.brand} {v.model}</span>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
