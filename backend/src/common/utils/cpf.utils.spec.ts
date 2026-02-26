import { isValidCpf, stripCpf } from './cpf.utils';

describe('stripCpf', () => {
  it('returns raw digits from formatted CPF', () => {
    expect(stripCpf('529.982.247-25')).toBe('52998224725');
  });

  it('returns the same string when already stripped', () => {
    expect(stripCpf('52998224725')).toBe('52998224725');
  });

  it('returns empty string for non-string input', () => {
    expect(stripCpf(null as any)).toBe('');
    expect(stripCpf(undefined as any)).toBe('');
  });
});

describe('isValidCpf', () => {
  it('validates a known-good CPF', () => {
    expect(isValidCpf('52998224725')).toBe(true);
  });

  it('validates a formatted CPF', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true);
  });

  it('rejects a CPF with fewer than 11 digits', () => {
    expect(isValidCpf('1234567890')).toBe(false);
  });

  it('rejects a CPF with all identical digits', () => {
    expect(isValidCpf('00000000000')).toBe(false);
    expect(isValidCpf('11111111111')).toBe(false);
  });

  it('rejects a CPF with invalid first check digit', () => {
    // Flip the 10th digit to make it wrong
    expect(isValidCpf('52998224715')).toBe(false);
  });

  it('rejects a CPF with invalid second check digit', () => {
    // Flip the 11th digit to make it wrong
    expect(isValidCpf('52998224724')).toBe(false);
  });
});
