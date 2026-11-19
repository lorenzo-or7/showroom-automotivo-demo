import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { getVehicle } from '../data/vehicles';
import { relatedVehicles } from '../data/inventory';
import { categoryLabels } from '../data/types';
import { useCompare } from '../hooks/useCompare';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatAcceleration, formatMileage, formatPrice, vehicleFullName, vehicleName } from '../lib/format';
import { buildInquiryMessage } from '../lib/message';
import { Gallery } from '../components/Gallery';
import { Icon } from '../components/Icon';
import { MessagePreview } from '../components/MessagePreview';
import { Modal } from '../components/Modal';
import { VehicleCard } from '../components/VehicleCard';
import { NotFoundPage } from './NotFoundPage';
import styles from './VehiclePage.module.css';

const ease = [0.22, 1, 0.36, 1] as const;

export default function VehiclePage() {
  const { id } = useParams();
  const vehicle = getVehicle(id);
  useDocumentTitle(vehicle ? vehicleFullName(vehicle) : 'Veículo não encontrado');
  if (!vehicle) return <NotFoundPage message="Este veículo não está na coleção. Ele pode ter sido removido da demonstração ou o endereço está incompleto." />;
  return <VehicleDetail key={vehicle.id} id={vehicle.id} />;
}

function VehicleDetail({ id }: { id: string }) {
  const v = getVehicle(id)!;
  const location = useLocation();
  const navigate = useNavigate();
  const compare = useCompare();
  const [inquiry, setInquiry] = useState(false);
  const [notice, setNotice] = useState('');
  const from = (location.state as { from?: string } | null)?.from;
  const inCompare = compare.has(v.id);
  const label = vehicleFullName(v);

  const backHref = from ? `${from}#estoque` : '/#estoque';
  const onBack = (e: React.MouseEvent) => {
    // Quando veio da listagem, volta no histórico para restaurar filtros e posição de rolagem
    if (from) {
      e.preventDefault();
      navigate(-1);
    }
  };

  const onCompare = () => {
    const ok = compare.toggle(v.id);
    setNotice(ok ? '' : `O comparador aceita até ${compare.limit} veículos. Remova um para incluir este.`);
  };

  const keySpecs = [
    { label: 'Potência', value: `${v.power} cv` },
    { label: '0 a 100 km/h', value: formatAcceleration(v.acceleration) },
    { label: 'Motor', value: v.engine },
    { label: 'Tração', value: v.drivetrain },
  ];

  const specs = [
    ['Marca', v.brand],
    ['Modelo', v.model],
    ['Versão', v.version],
    ['Ano', String(v.year)],
    ['Quilometragem', formatMileage(v.mileage)],
    ['Combustível', v.fuel],
    ['Câmbio', v.transmission],
    ['Carroceria', v.body],
    ['Categoria', categoryLabels[v.category]],
    ['Cor', v.color],
    ['Lugares', String(v.seats)],
    ['Referência', v.id],
  ];

  return (
    <motion.article className={styles.page} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} aria-labelledby="vehicle-title">
      <div className="container">
        <nav aria-label="Navegação do veículo" className={styles.crumbs}>
          <Link to={backHref} onClick={onBack} className={styles.back}>
            <Icon name="arrow-left" size={18} />
            Voltar ao estoque
          </Link>
        </nav>

        <div className={styles.top}>
          <Gallery images={v.images} vehicleId={v.id} vehicleLabel={label} />

          <motion.aside
            className={styles.summary}
            aria-label="Resumo e ações"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.15 }}
          >
            <p className={styles.brand}>{v.brand}</p>
            <h1 id="vehicle-title" className={`display ${styles.title}`}>
              {v.model} <span className={styles.version}>{v.version}</span>
            </h1>
            <ul className={styles.facts}>
              <li>{v.year}</li>
              <li>{formatMileage(v.mileage)}</li>
              <li>{v.transmission}</li>
              <li>{v.fuel}</li>
            </ul>
            <div className={styles.priceBlock}>
              <p className={styles.price}>{formatPrice(v.price)}</p>
              <p className={styles.priceNote}>Valor ilustrativo. Disponibilidade e condições sujeitas a confirmação.</p>
            </div>
            <div className={styles.ctas}>
              <Link to={{ pathname: '/', search: `?visita=${v.id}`, hash: '#agendar' }} className="btn btn--primary">
                Agendar visita
              </Link>
              <button type="button" className="btn" onClick={() => setInquiry(true)}>
                <Icon name="message" size={18} />
                Consultar veículo
              </button>
              <button type="button" className={`btn ${styles.compareBtn}`} aria-pressed={inCompare} onClick={onCompare}>
                <Icon name={inCompare ? 'check' : 'plus'} size={18} />
                {inCompare ? 'No comparador' : 'Adicionar ao comparador'}
              </button>
              {compare.ids.length > 0 && (
                <Link to="/comparar" className="text-link">
                  Abrir comparador ({compare.ids.length})
                </Link>
              )}
            </div>
            <p className={styles.notice} role="status" aria-live="polite">
              {notice}
            </p>
          </motion.aside>
        </div>

        <section className={styles.story} aria-labelledby="story-title">
          <h2 id="story-title" className={`display ${styles.lead}`}>
            {v.summary}
          </h2>
          <p className={styles.description}>{v.description}</p>
        </section>

        <section aria-labelledby="specs-title" className={styles.specsSection}>
          <div className={styles.specsHead}>
            <h2 id="specs-title" className={styles.h2}>
              Ficha técnica
            </h2>
            <p className={styles.specsNote}>Valores de referência do modelo. Confirme os dados do exemplar na visita.</p>
          </div>
          <dl className={styles.keySpecs}>
            {keySpecs.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
          <div className={styles.specsGrid}>
            <dl className={styles.specs}>
              {specs.map(([k, val]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{val}</dd>
                </div>
              ))}
            </dl>
            <div>
              <h3 className={styles.h3}>Destaques do modelo</h3>
              <ul className={styles.features}>
                {v.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="related-title" className={styles.related}>
          <h2 id="related-title" className={styles.h2}>
            Também na coleção
          </h2>
          <ul className={styles.relatedGrid}>
            {relatedVehicles(v).map((r) => (
              <li key={r.id}>
                <VehicleCard vehicle={r} slot="standard" />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <AnimatePresence>
        {inquiry && (
          <Modal
            title={`Consultar ${vehicleName(v)}`}
            description="Mensagem pronta com os dados deste veículo. Revise antes de enviar."
            onClose={() => setInquiry(false)}
          >
            <MessagePreview message={buildInquiryMessage(v)} />
          </Modal>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
