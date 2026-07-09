import { Prisma } from '@prisma/client';

/**
 * Converts a Prisma Decimal (or null) to the string-decimal representation
 * required by API_CONTRACT.md for money fields, e.g. `"1200.00"`.
 */
export function decimalToMoneyString(value: Prisma.Decimal | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return value.toFixed(2);
}

/**
 * Converts a Prisma Decimal (or null) to a plain JS number, used for
 * non-money numeric fields such as estimatedHours.
 */
export function decimalToNumber(value: Prisma.Decimal | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return value.toNumber();
}
