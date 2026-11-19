import { editorialImages as img } from '../data/editorial';
import { RevealImage } from './RevealImage';
import { SplitReveal } from './SplitReveal';
import styles from './Experience.module.css';

export function Experience() {
  return (
    <section id="experiencia" className={styles.section} aria-labelledby="experiencia-title">
      <div className="container">
        <div className={styles.opening}>
          <SplitReveal
            as="h2"
            className={`display ${styles.title}`}
            lines={['A luz certa', 'muda tudo', 'o que se vê.']}
            inView
          />
          <p className={styles.openingText}>
            Um showroom não precisa de pressa. Aqui cada carro é mostrado de perto, com detalhes visíveis e tempo para
            conversar sobre ele.
          </p>
        </div>

        <div className={styles.collage}>
          <RevealImage image={img.headlight} className={styles.big} sizes="(min-width: 900px) 58vw, 100vw" aspect="3 / 2" />
          <div className={styles.note} data-pos="a">
            <h3 className={styles.noteTitle}>Apresentação</h3>
            <p>
              Fotos com a mesma luz e o mesmo enquadramento para todos os carros, inclusive dos detalhes que mostram
              uso. O que está na foto é o que você vai encontrar.
            </p>
          </div>
          <RevealImage image={img.wheel} className={styles.portrait} sizes="(min-width: 900px) 30vw, 100vw" aspect="4 / 5" parallax={12} from="left" />
          <div className={styles.note} data-pos="b">
            <h3 className={styles.noteTitle}>Curadoria</h3>
            <p>
              Uma coleção curta é uma escolha. Preferimos poucos carros que conhecemos bem a muitos que conhecemos de
              longe.
            </p>
          </div>
        </div>

        <div className={styles.strip}>
          <RevealImage image={img.leather} className={styles.stripWide} sizes="(min-width: 900px) 50vw, 100vw" aspect="3 / 2" parallax={6} from="right" />
          <RevealImage image={img.rim} className={styles.stripTall} sizes="(min-width: 900px) 24vw, 50vw" aspect="3 / 4" parallax={10} />
          <RevealImage image={img.taillight} className={styles.stripTall} sizes="(min-width: 900px) 24vw, 50vw" aspect="3 / 4" parallax={14} />
        </div>

        <div className={styles.closing}>
          <h3 className={styles.noteTitle}>Atendimento</h3>
          <p className={`display ${styles.closingText}`}>
            Visitas com hora marcada, um carro por vez, com alguém que conhece o histórico dele e responde sem roteiro.
          </p>
        </div>
      </div>
    </section>
  );
}
