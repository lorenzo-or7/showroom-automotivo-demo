import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { isWhatsappConfigured, site } from '../config/site';
import { inventory } from '../data/inventory';
import { getVehicle } from '../data/vehicles';
import { dateBounds, emptyBooking, NOTES_MAX, validateBooking, type BookingErrors, type BookingValues } from '../lib/booking';
import { formatDateBR, vehicleFullName } from '../lib/format';
import { buildVisitMessage } from '../lib/message';
import { maskPhone } from '../lib/phone';
import { MessagePreview } from './MessagePreview';
import styles from './Booking.module.css';

const fieldOrder: (keyof BookingValues)[] = ['name', 'phone', 'vehicleId', 'date', 'time', 'notes', 'consent'];
const ease = [0.22, 1, 0.36, 1] as const;

export function Booking() {
  const [params] = useSearchParams();
  const preselected = params.get('visita') ?? '';
  const [values, setValues] = useState<BookingValues>(() => ({
    ...emptyBooking,
    vehicleId: getVehicle(preselected) ? preselected : '',
  }));
  const [errors, setErrors] = useState<BookingErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof BookingValues, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const uid = useId();

  const [today] = useState(() => new Date());
  const bounds = useMemo(() => dateBounds(today, site.visitWindowDays), [today]);
  const opts = useMemo(() => ({ today, windowDays: site.visitWindowDays, slots: site.visitSlots }), [today]);

  // Chegou de "Agendar visita" na página do veículo: pré-seleciona o modelo (ajuste durante o render)
  const [lastPreselected, setLastPreselected] = useState(preselected);
  if (preselected !== lastPreselected) {
    setLastPreselected(preselected);
    if (getVehicle(preselected)) {
      setValues((v) => ({ ...v, vehicleId: preselected }));
      setResult(null);
    }
  }

  useEffect(() => {
    if (result) resultRef.current?.focus();
  }, [result]);

  const set = <K extends keyof BookingValues>(key: K, value: BookingValues[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (submitted || touched[key]) setErrors(validateBooking(next, opts));
  };

  const blur = (key: keyof BookingValues) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validateBooking(values, opts));
  };

  const show = (key: keyof BookingValues) => (submitted || touched[key]) && errors[key];

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validateBooking(values, opts);
    setErrors(found);
    const first = fieldOrder.find((k) => found[k]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setResult(
      buildVisitMessage({
        name: values.name,
        phone: values.phone,
        vehicle: getVehicle(values.vehicleId),
        date: values.date,
        time: values.time,
        notes: values.notes,
      }),
    );
  };

  const restart = () => {
    setValues(emptyBooking);
    setErrors({});
    setTouched({});
    setSubmitted(false);
    setResult(null);
  };

  const errorCount = Object.keys(errors).length;
  const describedBy = (key: keyof BookingValues, hint?: boolean) =>
    [hint ? `${uid}-${key}-hint` : '', show(key) ? `${uid}-${key}-error` : ''].filter(Boolean).join(' ') || undefined;
  const selectedVehicle = getVehicle(values.vehicleId);

  return (
    <section id="agendar" className={styles.section} aria-labelledby="agendar-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}>
          <h2 id="agendar-title" className={`display ${styles.title}`}>
            Agende uma visita
          </h2>
          <p className={styles.text}>
            Escolha o carro, o dia e o horário. Você recebe uma mensagem pronta para enviar à loja; a visita só fica
            marcada depois que a loja confirmar.
          </p>
          <p className={styles.privacy}>
            Nesta demonstração, nenhum dado sai do seu navegador. Nada é armazenado ou enviado a servidores.
          </p>
        </div>

        <div className={styles.panel}>
          <AnimatePresence mode="wait" initial={false}>
            {result ? (
              <motion.div
                key="result"
                className={styles.result}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease }}
              >
                <h3 ref={resultRef} tabIndex={-1} className={styles.resultTitle}>
                  Solicitação preparada
                </h3>
                <p className={styles.resultText}>
                  Ainda não é um agendamento confirmado.{' '}
                  {isWhatsappConfigured()
                    ? 'Envie a mensagem pelo WhatsApp; a loja responde com a confirmação ou outro horário.'
                    : 'Copie a mensagem e envie à loja pelo canal de sua preferência; ela responde com a confirmação ou outro horário.'}
                </p>
                <dl className={styles.summary}>
                  <div>
                    <dt>Veículo</dt>
                    <dd>{selectedVehicle ? vehicleFullName(selectedVehicle) : 'Ainda não escolhido'}</dd>
                  </div>
                  <div>
                    <dt>Data e horário</dt>
                    <dd>
                      {formatDateBR(values.date)}, {values.time}
                    </dd>
                  </div>
                </dl>
                <MessagePreview message={result} sendLabel="Enviar solicitação pelo WhatsApp" />
                <div className={styles.resultActions}>
                  <button type="button" className="btn" onClick={() => setResult(null)}>
                    Editar dados
                  </button>
                  <button type="button" className={styles.linkBtn} onClick={restart}>
                    Começar uma nova solicitação
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                ref={formRef}
                className={styles.form}
                noValidate
                onSubmit={onSubmit}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease }}
                aria-describedby={`${uid}-required`}
              >
                <p id={`${uid}-required`} className={styles.required}>
                  Todos os campos são obrigatórios, exceto veículo e observações.
                </p>

                {submitted && errorCount > 0 && (
                  <p className={styles.errorSummary} role="alert">
                    {errorCount === 1 ? 'Falta corrigir 1 campo.' : `Faltam corrigir ${errorCount} campos.`}
                  </p>
                )}

                <div className={styles.row}>
                  <div className="field">
                    <label className="field__label" htmlFor={`${uid}-name`}>
                      Nome
                    </label>
                    <input
                      id={`${uid}-name`}
                      name="name"
                      className="input"
                      autoComplete="name"
                      maxLength={80}
                      value={values.name}
                      onChange={(e) => set('name', e.target.value)}
                      onBlur={() => blur('name')}
                      aria-invalid={show('name') ? true : undefined}
                      aria-describedby={describedBy('name')}
                    />
                    {show('name') && (
                      <p id={`${uid}-name-error`} className="field__error">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="field">
                    <label className="field__label" htmlFor={`${uid}-phone`}>
                      Telefone ou WhatsApp
                    </label>
                    <input
                      id={`${uid}-phone`}
                      name="phone"
                      className="input tabular"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      placeholder="(11) 98765-4321"
                      value={values.phone}
                      onChange={(e) => set('phone', maskPhone(e.target.value))}
                      onBlur={() => blur('phone')}
                      aria-invalid={show('phone') ? true : undefined}
                      aria-describedby={describedBy('phone')}
                    />
                    {show('phone') && (
                      <p id={`${uid}-phone-error`} className="field__error">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="field">
                  <label className="field__label" htmlFor={`${uid}-vehicle`}>
                    Veículo de interesse
                  </label>
                  <select
                    id={`${uid}-vehicle`}
                    name="vehicleId"
                    className="select"
                    value={values.vehicleId}
                    onChange={(e) => set('vehicleId', e.target.value)}
                  >
                    <option value="">Ainda não decidi</option>
                    {inventory.map((v) => (
                      <option key={v.id} value={v.id}>
                        {vehicleFullName(v)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.row}>
                  <div className="field">
                    <label className="field__label" htmlFor={`${uid}-date`}>
                      Data desejada
                    </label>
                    <input
                      id={`${uid}-date`}
                      name="date"
                      type="date"
                      className="input"
                      min={bounds.min}
                      max={bounds.max}
                      value={values.date}
                      onChange={(e) => set('date', e.target.value)}
                      onBlur={() => blur('date')}
                      aria-invalid={show('date') ? true : undefined}
                      aria-describedby={describedBy('date', true)}
                    />
                    <p id={`${uid}-date-hint`} className="field__hint">
                      A partir de amanhã, até {site.visitWindowDays} dias.
                    </p>
                    {show('date') && (
                      <p id={`${uid}-date-error`} className="field__error">
                        {errors.date}
                      </p>
                    )}
                  </div>

                  <div className="field">
                    <label className="field__label" htmlFor={`${uid}-time`}>
                      Horário
                    </label>
                    <select
                      id={`${uid}-time`}
                      name="time"
                      className="select tabular"
                      value={values.time}
                      onChange={(e) => set('time', e.target.value)}
                      onBlur={() => blur('time')}
                      aria-invalid={show('time') ? true : undefined}
                      aria-describedby={describedBy('time')}
                    >
                      <option value="">Escolha um horário</option>
                      {site.visitSlots.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {show('time') && (
                      <p id={`${uid}-time-error`} className="field__error">
                        {errors.time}
                      </p>
                    )}
                  </div>
                </div>

                <div className="field">
                  <label className="field__label" htmlFor={`${uid}-notes`}>
                    Observações
                  </label>
                  <textarea
                    id={`${uid}-notes`}
                    name="notes"
                    className="textarea"
                    rows={4}
                    maxLength={NOTES_MAX}
                    value={values.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    aria-describedby={describedBy('notes', true)}
                    placeholder="Ex.: gostaria de ver o carro com a capota aberta"
                  />
                  <p id={`${uid}-notes-hint`} className="field__hint tabular">
                    {values.notes.length} de {NOTES_MAX} caracteres
                  </p>
                </div>

                <div className={styles.consent}>
                  <input
                    id={`${uid}-consent`}
                    name="consent"
                    type="checkbox"
                    checked={values.consent}
                    onChange={(e) => set('consent', e.target.checked)}
                    aria-invalid={show('consent') ? true : undefined}
                    aria-describedby={describedBy('consent')}
                  />
                  <label htmlFor={`${uid}-consent`}>
                    Autorizo a loja a entrar em contato pelo telefone informado para tratar desta visita.
                  </label>
                  {show('consent') && (
                    <p id={`${uid}-consent-error`} className={`field__error ${styles.consentError}`}>
                      {errors.consent}
                    </p>
                  )}
                </div>

                <motion.button type="submit" className={`btn btn--primary ${styles.submit}`} whileTap={{ scale: 0.97 }}>
                  Preparar solicitação
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
