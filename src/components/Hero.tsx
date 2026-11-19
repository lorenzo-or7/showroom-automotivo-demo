import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { getVehicle } from '../data/vehicles';
import { formatMileage, vehicleName } from '../lib/format';
import { imageSrcSet, imageUrl } from '../lib/image';
import { SplitReveal } from './SplitReveal';
import styles from './Hero.module.css';

const featuredId = 'mercedes-amg-gt-c-2021';
const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const featured = getVehicle(featuredId)!;
  const cover = featured.images[0];

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-10%']);

  return (
    <section ref={ref} className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.media} data-failed={failed || undefined}>
        <motion.div className={styles.mediaInner} style={{ y: imageY }}>
          {!failed && (
            <motion.img
              className={styles.image}
              src={imageUrl(cover.id, { width: 1600 })}
              srcSet={imageSrcSet(cover.id, [828, 1280, 1920, 2560])}
              sizes="100vw"
              width={1920}
              height={1085}
              alt={cover.alt}
              fetchPriority="high"
              decoding="async"
              onError={() => setFailed(true)}
              initial={{ scale: 1.14, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 2.4, ease }}
            />
          )}
        </motion.div>
        <div className={styles.scrim} aria-hidden="true" />
      </div>

      <motion.div className={`container ${styles.content}`} style={{ y: contentY }}>
        <SplitReveal
          as="h1"
          className={`display ${styles.title}`}
          lines={['Feitos para', 'serem vistos', 'de perto.']}
          delay={0.35}
        />
        <div className={styles.footer}>
          <motion.div
            className={styles.lede}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.85, ease }}
          >
            <p className={styles.description}>
              Uma coleção curta de automóveis, apresentada com luz certa, ficha completa e atendimento com hora marcada.
            </p>
            <div className={styles.ctas}>
              <a href="#estoque" className="btn btn--light">
                Explorar coleção
              </a>
              <Link to={{ pathname: '/', hash: '#agendar' }} className="btn btn--ghost-light">
                Agendar visita
              </Link>
            </div>
          </motion.div>

          <motion.figure
            className={styles.placard}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.2 }}
          >
            <figcaption>
              <span className={styles.placardKicker}>Na imagem</span>
              <span className={styles.placardName}>
                {vehicleName(featured)} {featured.version}
              </span>
              <span className={styles.placardMeta}>
                {featured.year}, {formatMileage(featured.mileage)}, {featured.color.toLowerCase()}
              </span>
              <Link to={`/veiculo/${featured.id}`} className={styles.placardLink}>
                Ver ficha do veículo
              </Link>
            </figcaption>
          </motion.figure>
        </div>
      </motion.div>
    </section>
  );
}
