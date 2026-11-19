import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { useDialog } from '../hooks/useDialog';
import { Icon } from './Icon';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  description?: string;
}

/** Diálogo modal acessível. Renderize dentro de <AnimatePresence> para animar a saída. */
export function Modal({ title, description, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref, true, onClose);

  return createPortal(
    <div className={styles.root}>
      <motion.div
        className={styles.backdrop}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-hidden="true"
      />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-desc' : undefined}
        className={styles.panel}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 420, damping: 38 }}
      >
        <div className={styles.head}>
          <h2 id="modal-title" className={styles.title}>
            {title}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">
            <Icon name="close" />
          </button>
        </div>
        {description && (
          <p id="modal-desc" className={styles.desc}>
            {description}
          </p>
        )}
        {children}
      </motion.div>
    </div>,
    document.body,
  );
}
