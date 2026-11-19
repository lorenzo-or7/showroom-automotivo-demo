/** Máscara progressiva para telefone brasileiro: (11) 98765-4321 ou (11) 3456-7890. */
export function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Aceita fixo (10 dígitos) ou celular (11 dígitos, começando com 9 após o DDD). */
export function isValidPhone(value: string): boolean {
  const d = value.replace(/\D/g, '');
  if (!/^[1-9]{2}/.test(d)) return false;
  if (d.length === 10) return /^[2-5]/.test(d[2]);
  if (d.length === 11) return d[2] === '9';
  return false;
}
