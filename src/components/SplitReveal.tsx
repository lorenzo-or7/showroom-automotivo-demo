import { motion } from 'motion/react';
import type { ElementType } from 'react';

interface SplitRevealProps {
  /** Cada item vira uma linha mascarada. */
  lines: string[];
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  /** Anima ao entrar na viewport em vez de no carregamento. */
  inView?: boolean;
}

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Revelação tipográfica escalonada por linha.
 * O texto completo fica disponível para leitores de tela via aria-label.
 */
export function SplitReveal({ lines, as: Tag = 'h2', className, delay = 0, stagger = 0.09, inView = false }: SplitRevealProps) {
  const trigger = inView
    ? { whileInView: 'shown', viewport: { once: true, amount: 0.6 } }
    : { animate: 'shown' };

  return (
    <Tag className={className} aria-label={lines.join(' ')}>
      <motion.span style={{ display: 'block' }} initial="hidden" {...trigger} aria-hidden="true">
        {lines.map((line, i) => (
          <span key={i} style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.08em', marginBottom: '-0.08em' }}>
            <motion.span
              style={{ display: 'block', willChange: 'transform' }}
              variants={{
                hidden: { y: '105%' },
                shown: { y: '0%', transition: { duration: 1.05, ease, delay: delay + i * stagger } },
              }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
