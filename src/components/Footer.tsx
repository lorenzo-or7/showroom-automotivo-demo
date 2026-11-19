import { Link } from 'react-router-dom';
import { site } from '../config/site';
import styles from './Footer.module.css';

export function Footer() {
  const watermark = site.or7Watermark;
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brandCol}>
          <Link to="/" className={styles.wordmark}>
            {site.brand.name}
          </Link>
          <p className={styles.disclaimer}>
            Protótipo 04.01, showroom automotivo demonstrativo. Marca fictícia, veículos de exemplo, preços e
            quilometragens ilustrativos. Sem vínculo com as montadoras citadas.
          </p>
        </div>

        <nav aria-label="Rodapé" className={styles.nav}>
          <ul>
            {site.nav.map((item) => (
              <li key={item.id}>
                <Link to={{ pathname: '/', hash: `#${item.id}` }}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link to={{ pathname: '/', hash: '#agendar' }}>Agendar visita</Link>
            </li>
            <li>
              <Link to="/comparar">Comparador</Link>
            </li>
          </ul>
        </nav>

        <div className={styles.meta}>
          <p>
            Fotografias:{' '}
            <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer">
              Unsplash, sob a Licença Unsplash
              {' '}<span className="visually-hidden">(abre em nova aba)</span>
            </a>
          </p>
          <div className={styles.credit}>
            {/* Espaço reservado para a marca d'água oficial Or7.dev (configure em src/config/site.ts) */}
            {watermark.src ? (
              <img src={watermark.src} alt={watermark.alt} className={styles.watermark} height={20} />
            ) : null}
            <p>Desenvolvido por Or7.dev</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
