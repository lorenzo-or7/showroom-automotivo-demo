import { isValidPhone } from './phone';

export interface BookingValues {
  name: string;
  phone: string;
  vehicleId: string;
  date: string;
  time: string;
  notes: string;
  consent: boolean;
}

export type BookingErrors = Partial<Record<keyof BookingValues, string>>;

export const emptyBooking: BookingValues = {
  name: '',
  phone: '',
  vehicleId: '',
  date: '',
  time: '',
  notes: '',
  consent: false,
};

export const NOTES_MAX = 500;

/** Data local no formato AAAA-MM-DD. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dateBounds(today: Date, windowDays: number): { min: string; max: string } {
  const min = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const max = new Date(today.getFullYear(), today.getMonth(), today.getDate() + windowDays);
  return { min: toISODate(min), max: toISODate(max) };
}

export function validateBooking(
  v: BookingValues,
  opts: { today: Date; windowDays: number; slots: readonly string[] },
): BookingErrors {
  const errors: BookingErrors = {};
  const name = v.name.trim();
  if (name.length < 3) errors.name = 'Informe seu nome com pelo menos 3 letras.';
  else if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(name)) errors.name = 'Use apenas letras no nome.';

  if (!v.phone.trim()) errors.phone = 'Informe um telefone para retorno.';
  else if (!isValidPhone(v.phone)) errors.phone = 'Confira o telefone: DDD + número, ex.: (11) 98765-4321.';

  const { min, max } = dateBounds(opts.today, opts.windowDays);
  if (!v.date) errors.date = 'Escolha a data desejada.';
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date)) errors.date = 'Data inválida.';
  else if (v.date < min) errors.date = 'Escolha uma data a partir de amanhã.';
  else if (v.date > max) errors.date = `Escolha uma data nos próximos ${opts.windowDays} dias.`;

  if (!v.time) errors.time = 'Escolha um horário.';
  else if (!opts.slots.includes(v.time)) errors.time = 'Escolha um dos horários da lista.';

  if (v.notes.length > NOTES_MAX) errors.notes = `Use no máximo ${NOTES_MAX} caracteres.`;

  if (!v.consent) errors.consent = 'Autorize o contato para enviar a solicitação.';
  return errors;
}
