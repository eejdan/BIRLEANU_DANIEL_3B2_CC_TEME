export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function plusDays(days: number) {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
}

export function toPrettyDate(value?: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export function toHourMinute(totalSeconds: number) {
  const minutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const leftover = minutes % 60;
  return hours ? `${hours}h ${leftover}m` : `${leftover}m`;
}

export function safeNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function withDefault<T>(value: T | null | undefined, fallback: T) {
  return value ?? fallback;
}
