/* Strips all non-numeric characters from CPF.
  accepts both raw (12345678910) and formatted (123.456.789-10) 
 */
export function stripCpf(cpf: string): string {
  if (typeof cpf !== 'string') return ''
  return cpf.replace(/\D/g, '');
}

const calculateDigit = (cpf: string, factor: number): number => {
  let sum = 0;
  // O loop roda baseado no fator (se fator for 10, roda 9 vezes; se for 11, roda 10 vezes)
  for (let i = 0; i < factor - 1; i++) {
    sum += Number(cpf[i]) * (factor - i);
  }
  
  const remainder = (sum * 10) % 11;
  return remainder >= 10 ? 0 : remainder; // Simplificação do if duplo
};

export function isValidCpf(raw: string): boolean {
  const cpf = stripCpf(raw);

  if (cpf.length !== 11) return false;

  // Reject CPFs with all identical digits (e.g. 00000000000, 11111111111)
  if (/^(\d)\1{10}$/.test(cpf)) return false;

if (calculateDigit(cpf, 10) !== Number(cpf[9])) return false;
  if (calculateDigit(cpf, 11) !== Number(cpf[10])) return false;

  return true;
}