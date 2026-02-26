/** Strip all non-digit characters */
export function stripCpf(value: string): string {
  return value.replace(/\D/g, '');
}

/** Apply mask: 000.000.000-00 */
export function maskCpf(value: string): string {
  const digits = stripCpf(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/** Client-side CPF checksum validation (mirrors backend logic) */
export function isValidCpf(raw: string): boolean {
  const cpf = stripCpf(raw);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calc = (factor: number): number => {
    let sum = 0;
    for (let i = 0; i < factor - 1; i++) sum += Number(cpf[i]) * (factor - i);
    const rem = (sum * 10) % 11;
    return rem >= 10 ? 0 : rem;
  };

  return calc(10) === Number(cpf[9]) && calc(11) === Number(cpf[10]);
}
