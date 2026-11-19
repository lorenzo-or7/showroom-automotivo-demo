import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import type { VehicleImage } from '../data/types';
import { imgProps } from '../lib/image';

interface RevealImageProps {
  image: VehicleImage;
  sizes: string;
  className?: string;
  /** Intensidade do parallax em % da altura. 0 desliga. */
  parallax?: number;
  /** Direção da máscara. */
  from?: 'bottom' | 'left' | 'right';
  aspect?: string;
}

const easeMask = [0.65, 0, 0.35, 1] as const;
const easeOut = [0.22, 1, 0.36, 1] as const;

const hiddenClip = {
  bottom: 'inset(100% 0% 0% 0%)',
  left: 'inset(0% 100% 0% 0%)',
  right: 'inset(0% 0% 0% 100%)',
};

/**
 * Image mask reveal + parallax discreto.
 * O gatilho de viewport fica no wrapper sem recorte: um elemento totalmente
 * recortado por clip-path não é reportado como visível pelo IntersectionObserver.
 * Com movimento reduzido, a foto aparece estática.
 */
export function RevealImage({ image, sizes, className, parallax = 8, from = 'bottom', aspect }: RevealImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce || !parallax ? ['0%', '0%'] : [`-${parallax}%`, `${parallax}%`]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ position: 'relative', aspectRatio: aspect }}
      initial={reduce ? false : 'hidden'}
      whileInView="shown"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div
        style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'var(--stage)' }}
        variants={{
          hidden: { clipPath: hiddenClip[from] },
          shown: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 1.25, ease: easeMask } },
        }}
      >
        <motion.div style={{ position: 'absolute', inset: `-${parallax + 2}% 0`, y }}>
          <motion.img
            {...imgProps(image, { sizes, widths: [480, 828, 1280, 1920] })}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: image.focus }}
            variants={{
              hidden: { scale: 1.18 },
              shown: { scale: 1, transition: { duration: 1.6, ease: easeOut } },
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
