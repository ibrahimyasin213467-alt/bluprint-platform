import { describe, it, expect } from 'vitest';
import { validateTokenInput, sanitizeString } from '../app/lib/security/validateInput';

describe('validateTokenInput', () => {
  it('geçerli token kabul edilmeli', () => {
    const result = validateTokenInput({
      name: 'My Token',
      symbol: 'MTK',
      supply: 1_000_000,
      decimals: 9,
      description: 'Test token',
    });
    expect(result.valid).toBe(true);
  });

  it('kısa isim reddedilmeli', () => {
    const result = validateTokenInput({
      name: 'AB',
      symbol: 'MTK',
      supply: 1_000_000,
      decimals: 9,
      description: '',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('3-32');
  });

  it('geçersiz sembol reddedilmeli', () => {
    const result = validateTokenInput({
      name: 'My Token',
      symbol: 'mtk',
      supply: 1_000_000,
      decimals: 9,
      description: '',
    });
    expect(result.valid).toBe(false);
  });

  it('sıfır supply reddedilmeli', () => {
    const result = validateTokenInput({
      name: 'My Token',
      symbol: 'MTK',
      supply: 0,
      decimals: 9,
      description: '',
    });
    expect(result.valid).toBe(false);
  });

  it('çok büyük supply reddedilmeli', () => {
    const result = validateTokenInput({
      name: 'My Token',
      symbol: 'MTK',
      supply: 2_000_000_000_000,
      decimals: 9,
      description: '',
    });
    expect(result.valid).toBe(false);
  });

  it('geçersiz decimals reddedilmeli', () => {
    const result = validateTokenInput({
      name: 'My Token',
      symbol: 'MTK',
      supply: 1_000_000,
      decimals: 10,
      description: '',
    });
    expect(result.valid).toBe(false);
  });
});

describe('sanitizeString', () => {
  it('HTML tagları temizlenmeli', () => {
    expect(sanitizeString('<script>alert(1)</script>')).toBe('alert(1)');
  });

  it('normal string değişmemeli', () => {
    expect(sanitizeString('  My Token  ')).toBe('My Token');
  });
});