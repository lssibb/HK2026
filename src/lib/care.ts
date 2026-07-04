import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

import type {
  CareStatus,
  CareType,
  ExchangeStatus,
  Light,
} from "@/api/types";

export const LIGHT_LABEL: Record<Light, string> = {
  low: "Тень",
  medium: "Полутень",
  bright: "Яркий рассеянный",
  direct: "Прямое солнце",
};

/** 1–4 scale used to draw the light-level arc. */
export const LIGHT_RANK: Record<Light, number> = {
  low: 1,
  medium: 2,
  bright: 3,
  direct: 4,
};

const CARE_TYPE: Record<CareType, string> = {
  water: "Полив",
  repot: "Пересадка",
};

export function careTypeLabel(type: CareType): string {
  return CARE_TYPE[type];
}

export function careActionLabel(type: CareType): string {
  return type === "water" ? "Полил" : "Пересадил";
}

const STATUS: Record<CareStatus, string> = {
  overdue: "Просрочено",
  "due-today": "Сегодня",
  upcoming: "Скоро",
};

export function statusLabel(status: CareStatus): string {
  return STATUS[status];
}

/** Badge variant per care status — shared by dashboard, list and detail. */
export const CARE_STATUS_VARIANT: Record<
  CareStatus,
  "warn" | "orchid" | "secondary"
> = {
  overdue: "warn",
  "due-today": "orchid",
  upcoming: "secondary",
};

/** "задача" / "задачи" / "задач" for a count. */
export function pluralTasks(n: number): string {
  return plural(n, "задача", "задачи", "задач");
}

/**
 * Colour tone for the moisture "thirst" ring, from fresh to thirsty to overdue.
 * Returns a Tailwind text-* class (the ring uses stroke-current).
 */
export function moistureTone(progress: number | undefined): string {
  if (progress == null) return "text-muted-foreground/40";
  if (progress >= 1) return "text-orchid";
  if (progress >= 0.75) return "text-warn";
  return "text-living";
}

const EXCHANGE_STATUS: Record<ExchangeStatus, string> = {
  active: "Доступно",
  reserved: "Забронировано",
  closed: "Закрыто",
};

export function exchangeStatusLabel(status: ExchangeStatus): string {
  return EXCHANGE_STATUS[status];
}

export const EXCHANGE_STATUS_VARIANT: Record<
  ExchangeStatus,
  "living" | "warn" | "secondary"
> = {
  active: "living",
  reserved: "warn",
  closed: "secondary",
};

/** "раз в неделю" / "каждые 10 дней" — a natural cadence phrase. */
export function wateringCadence(days: number | undefined): string {
  if (!days) return "по состоянию грунта";
  if (days === 1) return "каждый день";
  if (days === 7) return "раз в неделю";
  if (days === 14) return "раз в 2 недели";
  return `каждые ${days} ${pluralDays(days)}`;
}

export function repotCadence(months: number | undefined): string {
  if (!months) return "по мере роста";
  if (months === 1) return "раз в месяц";
  if (months === 12) return "раз в год";
  const years = Math.round((months / 12) * 10) / 10;
  if (months % 12 === 0) return `раз в ${years} ${pluralYears(years)}`;
  return `раз в ${months} ${pluralMonths(months)}`;
}

export function humanDate(iso: string): string {
  return format(parseISO(iso), "d MMMM yyyy", { locale: ru });
}

export function humanDateShort(iso: string): string {
  return format(parseISO(iso), "d MMM", { locale: ru });
}

/** "через 3 дня" / "2 дня назад" for a due date. */
export function relativeDue(iso: string): string {
  return formatDistanceToNowStrict(parseISO(iso), {
    locale: ru,
    addSuffix: true,
  });
}

function pluralDays(n: number): string {
  return plural(n, "день", "дня", "дней");
}
function pluralMonths(n: number): string {
  return plural(n, "месяц", "месяца", "месяцев");
}
function pluralYears(n: number): string {
  return plural(Math.round(n), "год", "года", "лет");
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
