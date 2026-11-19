import { useCallback, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import type { VehicleImage } from '../data/types';
import { imageSrcSet, imageUrl } from '../lib/image';
import { Icon } from './Icon';
import { Lightbox } from './Lightbox';
import styles from './Gallery.module.css';

interface GalleryProps {
  images: VehicleImage[];
  vehicleId: string;
  vehicleLabel: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function Gallery({ images, vehicleId, vehicleLabel }: GalleryProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [lightbox, setLightbox] = useState(false);
  const count = images.length;
  const current = images[index];
  const multiple = count > 1;

  const go = useCallback(
    (next: number) => {
      const wrapped = (next + count) % count;
      setDirection(next > index ? 1 : -1);
      setIndex(wrapped);
    },
    [count, index],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!multiple) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(index - 1);
    }
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (!multiple) return;
    if (info.offset.x < -60 || info.velocity.x < -400) go(index + 1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(index - 1);
  };

  const closeLightbox = useCallback(() => setLightbox(false), []);

  return (
    <div className={styles.gallery}>
      <div
        className={styles.stageWrap}
        role="region"
        aria-roledescription="galeria"
        aria-label={`Fotos do ${vehicleLabel}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <motion.div layoutId={`media-${vehicleId}`} className={styles.stage} transition={{ duration: 0.7, ease }}>
          {/* Fundo desfocado da própria foto: preenche o palco sem recortar o carro */}
          <img
            key={`bg-${current.id}`}
            className={styles.ambient}
            src={imageUrl(current.id, { width: 480, quality: 40 })}
            alt=""
            aria-hidden="true"
          />
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.img
              key={current.id}
              custom={direction}
              className={styles.image}
              src={imageUrl(current.id, { width: 1600 })}
              srcSet={imageSrcSet(current.id, [828, 1280, 1600, 2200])}
              sizes="(min-width: 1100px) 64vw, 100vw"
              width={1600}
              height={Math.round(1600 / current.ratio)}
              alt={current.alt}
              draggable={false}
              drag={multiple ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={onDragEnd}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 40 }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: d * -40 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease }}
            />
          </AnimatePresence>
        </motion.div>

        <div className={styles.controls}>
          {multiple && (
            <>
              <button type="button" className={styles.ctrl} onClick={() => go(index - 1)} aria-label="Foto anterior">
                <Icon name="arrow-left" />
              </button>
              <p className={styles.counter} aria-live="polite">
                <span className="tabular">{index + 1}</span> de {count}
              </p>
              <button type="button" className={styles.ctrl} onClick={() => go(index + 1)} aria-label="Próxima foto">
                <Icon name="arrow-right" />
              </button>
            </>
          )}
          <button type="button" className={`${styles.ctrl} ${styles.expand}`} onClick={() => setLightbox(true)}>
            <Icon name="expand" />
            <span>Tela cheia</span>
          </button>
        </div>
      </div>

      {multiple && (
        <ul className={styles.thumbs} aria-label="Miniaturas">
          {images.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                className={styles.thumb}
                aria-current={i === index ? 'true' : undefined}
                aria-label={`Ver foto ${i + 1} de ${count}: ${img.alt}`}
                onClick={() => go(i)}
              >
                <img
                  src={imageUrl(img.id, { width: 240, height: 160, quality: 60 })}
                  alt=""
                  width={240}
                  height={160}
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: img.focus }}
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {lightbox && (
          <Lightbox images={images} startIndex={index} label={vehicleLabel} onClose={closeLightbox} onIndexChange={setIndex} />
        )}
      </AnimatePresence>
    </div>
  );
}
