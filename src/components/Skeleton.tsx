import styles from './Skeleton.module.css';

/** Esqueleto exibido enquanto o chunk da página de detalhes carrega. */
export function DetailSkeleton() {
  return (
    <div className={`container ${styles.page}`} aria-busy="true" aria-label="Carregando veículo">
      <div className={`${styles.block} ${styles.crumb}`} />
      <div className={styles.grid}>
        <div className={`${styles.block} ${styles.stage}`} />
        <div className={styles.side}>
          <div className={`${styles.block} ${styles.line}`} style={{ width: '30%' }} />
          <div className={`${styles.block} ${styles.title}`} />
          <div className={`${styles.block} ${styles.line}`} style={{ width: '70%' }} />
          <div className={`${styles.block} ${styles.price}`} />
          <div className={`${styles.block} ${styles.btn}`} />
          <div className={`${styles.block} ${styles.btn}`} />
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className={`container ${styles.page}`} aria-busy="true" aria-label="Carregando">
      <div className={`${styles.block} ${styles.title}`} style={{ width: '40%' }} />
      <div className={styles.cols}>
        <div className={`${styles.block} ${styles.card}`} />
        <div className={`${styles.block} ${styles.card}`} />
        <div className={`${styles.block} ${styles.card}`} />
      </div>
    </div>
  );
}
