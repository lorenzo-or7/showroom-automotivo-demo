import type { Vehicle } from '../data/types';
import { formatDateBR, formatMileage, formatPrice, vehicleFullName } from './format';

export interface VisitRequest {
  name: string;
  phone: string;
  vehicle?: Vehicle;
  date: string;
  time: string;
  notes: string;
}

/** Remove caracteres de controle e limita o tamanho de textos livres. */
export function sanitizeText(text: string, max = 500): string {
  return text
    // eslint-disable-next-line no-control-regex -- remoção intencional de caracteres de controle
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

export function buildVisitMessage(req: VisitRequest): string {
  const lines = [
    'Olá! Gostaria de solicitar uma visita ao showroom.',
    '',
    `Nome: ${sanitizeText(req.name, 80)}`,
    `Contato: ${req.phone}`,
    `Veículo de interesse: ${req.vehicle ? `${vehicleFullName(req.vehicle)} (ref. ${req.vehicle.id})` : 'Ainda não escolhi'}`,
    `Data desejada: ${formatDateBR(req.date)}`,
    `Horário desejado: ${req.time}`,
  ];
  const notes = sanitizeText(req.notes);
  if (notes) lines.push(`Observações: ${notes}`);
  lines.push('', 'Entendo que esta é uma solicitação e que a visita depende de confirmação.');
  return lines.join('\n');
}

export function buildInquiryMessage(v: Vehicle): string {
  return [
    `Olá! Tenho interesse no ${vehicleFullName(v)} (ref. ${v.id}).`,
    '',
    `Valor anunciado: ${formatPrice(v.price)}`,
    `Quilometragem: ${formatMileage(v.mileage)}`,
    '',
    'Poderiam confirmar a disponibilidade e me passar mais detalhes sobre o histórico do veículo?',
  ].join('\n');
}

export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
