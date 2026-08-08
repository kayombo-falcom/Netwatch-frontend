const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

export const isValidEmail = (value: string) => EMAIL_RE.test(value.trim());

export const isValidIPv4 = (value: string) => {
  const match = value.trim().match(IPV4_RE);
  if (!match) return false;
  return match.slice(1).every(octet => Number(octet) <= 255);
};

export const isInRange = (value: string, min: number, max: number) => {
  if (value.trim() === "" || Number.isNaN(Number(value))) return false;
  const n = Number(value);
  return n >= min && n <= max;
};
