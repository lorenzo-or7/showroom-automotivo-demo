import { describe, expect, it } from 'vitest';
import { vehicles } from '../data/vehicles';
import { brands } from '../data/inventory';
import { applyFilters, countActiveFilters, emptyFilters, filtersFromParams, filtersToParams } from './filters';
import { isValidPhone, maskPhone } from './phone';
import { dateBounds, emptyBooking, validateBooking } from './booking';
import { buildInquiryMessage, buildVisitMessage, sanitizeText, whatsappLink } from './message';
import { buildCompareRows } from './compare';
import { isWhatsappConfigured } from '../config/site';

describe('catálogo', () => {
  it('tem ao menos 9 veículos com IDs únicos e imagens', () => {
    expect(vehicles.length).toBeGreaterThanOrEqual(9);
    expect(new Set(vehicles.map((v) => v.id)).size).toBe(vehicles.length);
    vehicles.forEach((v) => {
      expect(v.images.length).toBeGreaterThan(0);
      v.images.forEach((img) => expect(img.alt.length).toBeGreaterThan(10));
    });
  });
});

describe('filtros', () => {
  it('filtra por marca, categoria, câmbio, ano e preço', () => {
    expect(applyFilters(vehicles, { ...emptyFilters, brand: 'Porsche' }).every((v) => v.brand === 'Porsche')).toBe(true);
    expect(applyFilters(vehicles, { ...emptyFilters, category: 'suvs' }).map((v) => v.body)).toEqual(['SUV', 'SUV', 'SUV']);
    expect(applyFilters(vehicles, { ...emptyFilters, transmission: 'Manual' }).map((v) => v.id).sort()).toEqual([
      'ford-mustang-1967',
      'mazda-mx5-2020',
    ]);
    expect(applyFilters(vehicles, { ...emptyFilters, minYear: 2023 }).every((v) => v.year >= 2023)).toBe(true);
    const ate400 = applyFilters(vehicles, { ...emptyFilters, price: 'ate-400' });
    expect(ate400.every((v) => v.price < 400_000)).toBe(true);
  });

  it('busca ignora acentos e combina termos', () => {
    expect(applyFilters(vehicles, { ...emptyFilters, query: 'eletrico' }).map((v) => v.id)).toEqual(['porsche-taycan-4s-2023', 'volvo-xc60-recharge-2022']);
    expect(applyFilters(vehicles, { ...emptyFilters, query: 'porsche 2019' }).map((v) => v.id)).toEqual(['porsche-911-gt3-2019']);
    expect(applyFilters(vehicles, { ...emptyFilters, query: 'xyz inexistente' })).toHaveLength(0);
  });

  it('ordena por preço, ano e quilometragem', () => {
    const asc = applyFilters(vehicles, { ...emptyFilters, sort: 'preco-asc' }).map((v) => v.price);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    const km = applyFilters(vehicles, { ...emptyFilters, sort: 'km-asc' }).map((v) => v.mileage);
    expect(km).toEqual([...km].sort((a, b) => a - b));
    expect(applyFilters(vehicles, { ...emptyFilters, sort: 'ano-desc' })[0].year).toBe(2023);
  });

  it('sincroniza com a URL e descarta valores inválidos', () => {
    const f = { ...emptyFilters, brand: 'BMW', transmission: 'Manual' as const, minYear: 2020, sort: 'preco-desc' as const, query: 'm3' };
    const params = filtersToParams(f, new URLSearchParams('visita=x'));
    expect(params.get('visita')).toBe('x');
    expect(filtersFromParams(params, brands)).toEqual(f);
    const bad = filtersFromParams(new URLSearchParams('marca=Fake&categoria=x&preco=y&ano=abc&cambio=z&ordem=w'), brands);
    expect(bad).toEqual(emptyFilters);
    expect(countActiveFilters(f)).toBe(4);
  });
});

describe('telefone', () => {
  it('aplica máscara progressiva', () => {
    expect(maskPhone('11987654321')).toBe('(11) 98765-4321');
    expect(maskPhone('1134567890')).toBe('(11) 3456-7890');
    expect(maskPhone('119')).toBe('(11) 9');
    expect(maskPhone('abc')).toBe('');
  });
  it('valida celular e fixo', () => {
    expect(isValidPhone('(11) 98765-4321')).toBe(true);
    expect(isValidPhone('(11) 3456-7890')).toBe(true);
    expect(isValidPhone('(11) 8765-4321')).toBe(false);
    expect(isValidPhone('(01) 98765-4321')).toBe(false);
    expect(isValidPhone('123')).toBe(false);
  });
});

describe('agendamento', () => {
  const today = new Date(2026, 10, 18);
  const opts = { today, windowDays: 60, slots: ['10:00', '14:00'] };

  it('exige campos obrigatórios e consentimento', () => {
    const errors = validateBooking(emptyBooking, opts);
    expect(Object.keys(errors).sort()).toEqual(['consent', 'date', 'name', 'phone', 'time']);
  });

  it('rejeita data passada, hoje e fora da janela', () => {
    const { min, max } = dateBounds(today, 60);
    expect(min).toBe('2026-11-19');
    expect(max).toBe('2027-01-17');
    const base = { ...emptyBooking, name: 'Ana Souza', phone: '(11) 98765-4321', time: '10:00', consent: true };
    expect(validateBooking({ ...base, date: '2026-11-18' }, opts).date).toBeDefined();
    expect(validateBooking({ ...base, date: '2027-02-01' }, opts).date).toBeDefined();
    expect(validateBooking({ ...base, date: '2026-11-20' }, opts)).toEqual({});
  });

  it('rejeita horário fora da lista', () => {
    const v = { ...emptyBooking, name: 'Ana', phone: '(11) 98765-4321', date: '2026-11-20', time: '03:00', consent: true };
    expect(validateBooking(v, opts).time).toBeDefined();
  });
});

describe('mensagens', () => {
  const v = vehicles[0];

  it('monta solicitação de visita com dados do veículo e aviso de confirmação', () => {
    const msg = buildVisitMessage({ name: 'Ana Souza', phone: '(11) 98765-4321', vehicle: v, date: '2026-11-20', time: '14:00', notes: '' });
    expect(msg).toContain('Ana Souza');
    expect(msg).toContain(v.model);
    expect(msg).toContain(v.id);
    expect(msg).toContain('20/11/2026');
    expect(msg).toContain('depende de confirmação');
    expect(msg).not.toContain('Observações');
  });

  it('consulta inclui modelo, preço e pede confirmação de disponibilidade', () => {
    const msg = buildInquiryMessage(v);
    expect(msg).toContain(`${v.brand} ${v.model}`);
    expect(msg).toMatch(/disponibilidade/);
  });

  it('remove caracteres de controle e limita tamanho', () => {
    expect(sanitizeText('oi\u0000\u0007 tudo', 500)).toBe('oi tudo');
    expect(sanitizeText('a'.repeat(600)).length).toBe(500);
  });

  it('codifica o link do WhatsApp', () => {
    expect(whatsappLink('5511999990000', 'Olá & tchau')).toBe('https://wa.me/5511999990000?text=Ol%C3%A1%20%26%20tchau');
  });

  it('só considera WhatsApp configurado com número internacional válido', () => {
    expect(isWhatsappConfigured('')).toBe(false);
    expect(isWhatsappConfigured('11999990000')).toBe(false);
    expect(isWhatsappConfigured('5511999990000')).toBe(true);
  });
});

describe('comparador', () => {
  it('marca diferenças e notas neutras sem eleger vencedor', () => {
    const [a, b] = [vehicles.find((v) => v.id === 'mazda-mx5-2020')!, vehicles.find((v) => v.id === 'ford-mustang-1967')!];
    const rows = buildCompareRows([a, b]);
    const price = rows.find((r) => r.key === 'price')!;
    expect(price.differs).toBe(true);
    expect(price.notes).toEqual(['Menor valor', null]);
    expect(rows.find((r) => r.key === 'transmission')!.differs).toBe(false);
    const accel = rows.find((r) => r.key === 'acceleration')!;
    expect(accel.notes).toEqual([null, null]); // só um valor de referência: sem nota
    expect(rows.flatMap((r) => r.notes).join(' ')).not.toMatch(/melhor|vencedor/i);
  });
});
