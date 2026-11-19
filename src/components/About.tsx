import { site } from '../config/site';
import styles from './About.module.css';

const adaptations = [
  {
    term: 'Estoque real',
    desc: 'O catálogo lê um único módulo de dados. Basta trocá-lo por uma integração com o sistema de estoque da loja, mantendo o mesmo formato.',
  },
  {
    term: 'CRM',
    desc: 'As solicitações de visita já saem estruturadas, com veículo, data e horário, prontas para virar oportunidade no CRM.',
  },
  {
    term: 'WhatsApp',
    desc: 'Com o número da loja configurado, as mensagens abrem direto no WhatsApp. Sem número, o site oferece a cópia do texto.',
  },
  {
    term: 'Identidade',
    desc: 'Nome, cores, tipografia e fotos ficam em tokens e arquivos de configuração, separados dos componentes.',
  },
];

export function About() {
  return (
    <section id="sobre" className={styles.section} aria-labelledby="sobre-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.lead}>
          <h2 id="sobre-title" className={`display ${styles.title}`}>
            Sobre esta demonstração
          </h2>
          <p className={styles.text}>
            {site.brand.name} é uma loja fictícia, criada pela Or7.dev para mostrar como um showroom digital pode
            apresentar poucos carros com o cuidado de uma galeria. Os veículos são exemplos, os valores são
            ilustrativos e não há vínculo com as marcas exibidas.
          </p>
        </div>
        <div>
          <h3 className={styles.subtitle}>O que muda na versão de uma concessionária</h3>
          <dl className={styles.list}>
            {adaptations.map((a) => (
              <div key={a.term} className={styles.item}>
                <dt>{a.term}</dt>
                <dd>{a.desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
