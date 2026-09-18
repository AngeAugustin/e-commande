/** Lettres (accents inclus), espaces, tirets et apostrophes. */
const NAME_ALLOWED = /[^\p{L}\s'-]/gu;
const NAME_VALID = /^[\p{L}]+(?:[\s'-][\p{L}]+)*$/u;

export function sanitizeCustomerName(value: string): string {
  return value.replace(NAME_ALLOWED, "").replace(/\s{2,}/g, " ");
}

export function isValidCustomerName(value: string): boolean {
  const name = value.trim();
  return name.length > 0 && NAME_VALID.test(name);
}

export function sanitizeCustomerPhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidCustomerPhone(value: string): boolean {
  const phone = sanitizeCustomerPhone(value);
  return phone.length >= 8 && phone.length <= 15;
}
