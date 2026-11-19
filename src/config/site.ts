/**
 * Configuração central da demonstração.
 * Para adaptar a uma concessionária real, altere os valores abaixo
 * (ou defina as variáveis de ambiente indicadas em `.env.example`).
 */

export interface NavItem {
  id: SectionId;
  label: string;
}

export type SectionId = 'estoque' | 'experiencia' | 'sobre' | 'contato' | 'agendar';

const envWhatsapp = (import.meta.env.VITE_WHATSAPP_NUMBER ?? '').replace(/\D/g, '');

export const site = {
  brand: {
    name: 'Ferrum',
    descriptor: 'Showroom demonstrativo',
  },
  /**
   * Número de WhatsApp no formato internacional, só dígitos (ex.: 5511999990000).
   * Vazio = a interface mostra uma prévia copiável da mensagem em vez do botão de envio.
   */
  whatsappNumber: envWhatsapp,
  /** E-mail de contato. Vazio = não exibido. */
  contactEmail: (import.meta.env.VITE_CONTACT_EMAIL ?? '').trim(),
  /** Horários oferecidos no formulário de visita. */
  visitSlots: ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
  /** Quantos dias à frente o formulário aceita para a visita. */
  visitWindowDays: 60,
  /** Asset oficial da marca d'água Or7.dev. Vazio = só o crédito em texto. */
  or7Watermark: {
    src: '',
    alt: 'Or7.dev',
  },
  nav: [
    { id: 'estoque', label: 'Estoque' },
    { id: 'experiencia', label: 'Experiência' },
    { id: 'sobre', label: 'Sobre' },
    { id: 'contato', label: 'Contato' },
  ] satisfies NavItem[],
  compareLimit: 3,
  storageKeys: {
    theme: 'ferrum:theme',
    compare: 'ferrum:compare',
  },
} as const;

export function isWhatsappConfigured(number: string = site.whatsappNumber): boolean {
  return /^\d{12,13}$/.test(number);
}
