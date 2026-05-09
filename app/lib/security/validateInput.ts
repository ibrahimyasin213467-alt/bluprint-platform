export interface TokenInput {
  name: string;
  symbol: string;
  supply: number;
  decimals: number;
  description: string;
}

export function validateTokenInput(input: TokenInput): { valid: boolean; error?: string } {
  // Name: 3-32 karakter, harf/numara/boşluk
  if (!input.name || input.name.length < 3 || input.name.length > 32) {
    return { valid: false, error: "Token name must be 3-32 characters" };
  }
  if (!/^[a-zA-Z0-9\s]+$/.test(input.name)) {
    return { valid: false, error: "Token name can only contain letters, numbers, and spaces" };
  }
  
  // Symbol: 2-10 karakter, uppercase
  if (!input.symbol || input.symbol.length < 2 || input.symbol.length > 10) {
    return { valid: false, error: "Symbol must be 2-10 characters" };
  }
  if (!/^[A-Z0-9]+$/.test(input.symbol)) {
    return { valid: false, error: "Symbol must be uppercase letters and numbers only" };
  }
  
  // Supply: pozitif, max 1 trilyon
  if (input.supply <= 0 || input.supply > 1_000_000_000_000) {
    return { valid: false, error: "Supply must be between 1 and 1,000,000,000,000" };
  }
  
  // Decimals: 0-9
  if (input.decimals < 0 || input.decimals > 9) {
    return { valid: false, error: "Decimals must be 0-9" };
  }
  
  // Description: max 280 karakter, HTML temizle
  if (input.description && input.description.length > 280) {
    return { valid: false, error: "Description max 280 characters" };
  }
  
  return { valid: true };
}

export function sanitizeString(str: string): string {
  return str
    .replace(/<[^>]*>/g, '')
    .trim();
}
