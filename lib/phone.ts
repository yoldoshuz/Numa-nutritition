/**
 * Formats a phone field as it is typed: `+998 90 123 45 67`.
 *
 * The API only accepts `+998XXXXXXXXX`, but a customer typing into a bare text
 * box has no way of knowing that, so numbers arrived as `90 123 45 67`,
 * `8 90 …`, `+998(90)…` and were rejected as malformed at checkout. The field
 * now carries the country code itself and groups the digits, so what the
 * customer sees always matches what the backend will accept.
 *
 * Extra digits past the ninth are dropped rather than silently appended to a
 * number that could no longer be dialled.
 */
export function formatUzPhoneInput(input: string): string {
  let digits = input.replace(/\D/g, "");

  // The user typed the country code, or pasted a number that carries it.
  if (digits.startsWith("998")) digits = digits.slice(3);
  // A leading trunk `8`, the way the number is dictated out loud.
  else if (digits.length === 10 && digits.startsWith("8")) digits = digits.slice(1);

  digits = digits.slice(0, 9);

  const groups = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 7),
    digits.slice(7, 9),
  ].filter(Boolean);

  return groups.length ? `+998 ${groups.join(" ")}` : "+998 ";
}

/** Value a phone input starts life with, so the prefix is never typed by hand. */
export const UZ_PHONE_PREFIX = "+998 ";
