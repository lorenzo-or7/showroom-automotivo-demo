import { useId } from 'react';
import { isWhatsappConfigured, site } from '../config/site';
import { useCopy } from '../hooks/useCopy';
import { whatsappLink } from '../lib/message';
import { Icon } from './Icon';
import styles from './MessagePreview.module.css';

interface MessagePreviewProps {
  message: string;
  /** Texto do botão de WhatsApp (só aparece com número configurado). */
  sendLabel?: string;
}

/**
 * Mostra a mensagem estruturada. Com WhatsApp configurado, oferece o envio;
 * sem número, oferece apenas a cópia, sem botão quebrado.
 */
export function MessagePreview({ message, sendLabel = 'Enviar pelo WhatsApp' }: MessagePreviewProps) {
  const { status, copy } = useCopy();
  const id = useId();
  const configured = isWhatsappConfigured();

  return (
    <div className={styles.wrap}>
      <label htmlFor={id} className="field__label">
        Prévia da mensagem
      </label>
      <textarea id={id} className={`textarea ${styles.preview}`} readOnly value={message} rows={Math.min(12, message.split('\n').length + 1)} />
      <div className={styles.actions}>
        {configured && (
          <a className="btn btn--primary" href={whatsappLink(site.whatsappNumber, message)} target="_blank" rel="noopener noreferrer">
            <Icon name="message" size={18} />
            {sendLabel}
            {' '}<span className="visually-hidden">(abre em nova aba)</span>
          </a>
        )}
        <button type="button" className={configured ? 'btn' : 'btn btn--primary'} onClick={() => copy(message)}>
          <Icon name={status === 'copied' ? 'check' : 'copy'} size={18} />
          {status === 'copied' ? 'Mensagem copiada' : 'Copiar mensagem'}
        </button>
      </div>
      <p className={styles.note} role="status" aria-live="polite">
        {status === 'error'
          ? 'Não foi possível copiar automaticamente. Selecione o texto acima e copie manualmente.'
          : configured
            ? 'O WhatsApp abre com a mensagem preenchida. Nada é enviado sem a sua confirmação no aplicativo.'
            : 'Nesta demonstração não há número de WhatsApp configurado. Copie a mensagem e envie pelo canal que preferir.'}
      </p>
    </div>
  );
}
