const UNIT_MS: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
};

export function parseExpiresInToMs(expiresIn: string): number {
  const trimmed = expiresIn.trim();

  if (/^\d+$/.test(trimmed)) {
    return Number.parseInt(trimmed, 10) * 1_000;
  }

  const match = /^(\d+)\s*([smhdw])$/i.exec(trimmed);

  if (!match) {
    throw new Error(`Invalid duration format: ${expiresIn}`);
  }

  const value = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multiplier = UNIT_MS[unit];

  if (!multiplier) {
    throw new Error(`Invalid duration unit: ${unit}`);
  }

  return value * multiplier;
}

export function expiresInToDate(
  expiresIn: string,
  from: Date = new Date(),
): Date {
  return new Date(from.getTime() + parseExpiresInToMs(expiresIn));
}
