import { Link } from 'react-router-dom';
import { isWhatsappConfigured, site } from '../config/site';
import { editorialImages } from '../data/editorial';
import { maskPhone } from '../lib/phone';
import { RevealImage } from './RevealImage';
import { SplitReveal } from './SplitReveal';
import styles from './Contact.module.css';

export function Contact() {
  const whatsapp = isWhatsappConfigured();
  const localNumber = whatsapp ? maskPhone(site.whatsappNumber.slice(2)) : '';

  return (
    <section id="contato" className={styles.section} aria-labelledby="contato-title">
      <div className={styles.stage}>
        <RevealImage image={editorialImages.finale} className={styles.media} sizes="100vw" parallax={10} />
        <div className={styles.scrim} aria-hidden="true" />
        <div className={`container ${styles.content}`}>
          <SplitReveal as="h2" className={`display ${styles.title}`} lines={['Marque a hora.', 'O carro espera.']} inView />
          <div className={styles.ctas}>
            <Link to={{ pathname: '/', hash: '#agendar' }} className="btn btn--light">
              Agendar visita
            </Link>
            <Link to={{ pathname: '/', hash: '#estoque' }} className="btn btn--ghost-light">
              Rever a coleção
            </Link>
          </div>
        </div>
      </div>

      <div className={`container ${styles.channels}`}>
        <h3 className="visually-hidden">Canais de contato</h3>
        <dl className={styles.list}>
          <div>
            <dt>Visitas</dt>
            <dd>
              Somente com hora marcada, pelo{' '}
              <Link to={{ pathname: '/', hash: '#agendar' }} className="text-link">
                formulário de agendamento
              </Link>
              .
            </dd>
          </div>
          <div>
            <dt>WhatsApp</dt>
            <dd>
              {whatsapp ? (
                <a className="text-link" href={`https://wa.me/${site.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                  {localNumber}
                  {' '}<span className="visually-hidden">(abre em nova aba)</span>
                </a>
              ) : (
                'Não configurado nesta demonstração. As mensagens geradas podem ser copiadas.'
              )}
            </dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>
              {site.contactEmail ? (
                <a className="text-link" href={`mailto:${site.contactEmail}`}>
                  {site.contactEmail}
                </a>
              ) : (
                'Não configurado nesta demonstração.'
              )}
            </dd>
          </div>
          <div>
            <dt>Endereço</dt>
            <dd>Loja fictícia, sem endereço físico. Na versão real, entra aqui com mapa e horários.</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
