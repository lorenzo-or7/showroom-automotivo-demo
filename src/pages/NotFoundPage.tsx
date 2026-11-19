import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import styles from './NotFoundPage.module.css';

export function NotFoundPage({ message }: { message?: string }) {
  useDocumentTitle('Página não encontrada');
  return (
    <section className={`container ${styles.page}`} aria-labelledby="nf-title">
      <h1 id="nf-title" className={`display ${styles.title}`}>
        Esta vaga está vazia.
      </h1>
      <p className={styles.text}>{message ?? 'O endereço não corresponde a nenhuma página deste showroom.'}</p>
      <div className={styles.actions}>
        <Link to="/#estoque" className="btn btn--primary">
          Ver a coleção
        </Link>
        <Link to="/" className="btn">
          Ir para o início
        </Link>
      </div>
    </section>
  );
}
