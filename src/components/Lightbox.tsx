import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import type { VehicleImage } from '../data/types';
import { useDialog } from '../hooks/useDialog';
import { imageSrcSet, imageUrl } from '../lib/image';
import { Icon } from './Icon';
import styles from './Lightbox.module.css';

interface LightboxProps {
  images: VehicleImage[];
  startIndex: number;
  label: string;
  onClose: () => void;
  onIndexChange?: (i: number) => void;
}

const ZOOM = 2.2;

/** Visão imersiva em tela cheia, com zoom e arraste quando ampliada. Sem simulação 360°. */
export function Lightbox({ images, startIndex, label, onClose, onIndexChange }: LightboxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const [bounds, setBounds] = useState({ x: 0, y: 0 });
  const count = images.length;
  const current = images[index];
  useDialog(ref, true, onClose);

  const go = useCallback(
    (next: number) => {
      const wrapped = (next + count) % count;
      setZoomed(false);
      setIndex(wrapped);
      onIndexChange?.(wrapped);
    },
    [count, onIndexChange],
  );

  // Limites de arraste quando ampliado, a partir do tamanho real renderizado
  useEffect(() => {
    const measure = () => {
      const frame = frameRef.current;
      if (!frame) return;
      const img = frame.querySelector('img');
      if (!img) return;
      const { width: fw, height: fh } = frame.getBoundingClientRect();
      const ratio = current.ratio;
      const renderW = Math.min(fw, fh * ratio);
      const renderH = renderW / ratio;
      setBounds({
        x: Math.max(0, (renderW * ZOOM - fw) / 2),
        y: Math.max(0, (renderH * ZOOM - fh) / 2),
      });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [current, zoomed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && count > 1) go(index + 1);
      else if (e.key === 'ArrowLeft' && count > 1) go(index - 1);
      else if (e.key === '+' || e.key === '=') setZoomed(true);
      else if (e.key === '-') setZoomed(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [go, index, count]);

  return createPortal(
    <motion.div
      ref={ref}
      className={styles.root}
      role="dialog"
      aria-modal="true"
      aria-label={`Visão em tela cheia: ${label}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.top}>
        <p className={styles.caption}>
          <span className={styles.label}>{label}</span>
          {count > 1 && (
            <span className="tabular">
              {index + 1} de {count}
            </span>
          )}
        </p>
        <div className={styles.tools}>
          <button
            type="button"
            className={styles.tool}
            onClick={() => setZoomed((z) => !z)}
            aria-pressed={zoomed}
            aria-label={zoomed ? 'Reduzir zoom' : 'Ampliar foto'}
          >
            <Icon name={zoomed ? 'zoom-out' : 'zoom-in'} />
          </button>
          <button type="button" className={styles.tool} onClick={onClose} aria-label="Fechar tela cheia" data-autofocus>
            <Icon name="close" />
          </button>
        </div>
      </div>

      <div ref={frameRef} className={styles.frame} data-zoomed={zoomed || undefined}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.img
            key={current.id}
            className={styles.image}
            src={imageUrl(current.id, { width: 2200, quality: 75 })}
            srcSet={imageSrcSet(current.id, [1280, 1920, 2560, 3200], 75)}
            sizes="100vw"
            alt={current.alt}
            draggable={false}
            drag={zoomed}
            dragConstraints={{ left: -bounds.x, right: bounds.x, top: -bounds.y, bottom: bounds.y }}
            dragElastic={0.08}
            dragMomentum={false}
            onDoubleClick={() => setZoomed((z) => !z)}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={zoomed ? { opacity: 1, scale: ZOOM } : { opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 32 }}
          />
        </AnimatePresence>
      </div>

      <div className={styles.bottom}>
        {count > 1 ? (
          <>
            <button type="button" className={styles.nav} onClick={() => go(index - 1)} aria-label="Foto anterior">
              <Icon name="arrow-left" />
            </button>
            <p className={styles.hint}>Duplo clique ou botão de lupa para ampliar. Setas do teclado trocam a foto.</p>
            <button type="button" className={styles.nav} onClick={() => go(index + 1)} aria-label="Próxima foto">
              <Icon name="arrow-right" />
            </button>
          </>
        ) : (
          <p className={styles.hint}>Duplo clique ou botão de lupa para ampliar.</p>
        )}
      </div>
    </motion.div>,
    document.body,
  );
}
