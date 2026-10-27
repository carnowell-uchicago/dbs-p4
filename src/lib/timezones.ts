// The time-zone menu: one option per common region, named by its best-known cities, with
// its official GMT offset worked out for *today* (so daylight saving is always right:
// Chicago is GMT−05:00 in summer and GMT−06:00 in winter).

export const COMMON_ZONES: { zone: string; label: string }[] = [
  { zone: "Pacific/Honolulu", label: "Hawaii: Honolulu" },
  { zone: "America/Anchorage", label: "Alaska: Anchorage" },
  { zone: "America/Los_Angeles", label: "Pacific Time: Los Angeles, Seattle, Vancouver" },
  { zone: "America/Denver", label: "Mountain Time: Denver, Salt Lake City, Calgary" },
  { zone: "America/Phoenix", label: "Arizona: Phoenix" },
  { zone: "America/Chicago", label: "Central Time: Chicago, Dallas, Winnipeg" },
  { zone: "America/Mexico_City", label: "Mexico City, Guadalajara" },
  { zone: "America/New_York", label: "Eastern Time: New York, Toronto, Miami" },
  { zone: "America/Bogota", label: "Bogotá, Lima, Quito" },
  { zone: "America/Halifax", label: "Atlantic Time: Halifax, Puerto Rico" },
  { zone: "America/Sao_Paulo", label: "São Paulo, Buenos Aires, Montevideo" },
  { zone: "Europe/London", label: "London, Dublin, Lisbon" },
  { zone: "Europe/Paris", label: "Paris, Berlin, Madrid, Rome" },
  { zone: "Africa/Lagos", label: "Lagos, Kinshasa, Algiers" },
  { zone: "Europe/Athens", label: "Athens, Helsinki, Kyiv" },
  { zone: "Africa/Johannesburg", label: "Johannesburg, Cairo" },
  { zone: "Europe/Istanbul", label: "Istanbul, Moscow, Riyadh, Nairobi" },
  { zone: "Asia/Dubai", label: "Dubai, Abu Dhabi" },
  { zone: "Asia/Karachi", label: "Karachi, Tashkent" },
  { zone: "Asia/Kolkata", label: "India: Mumbai, Delhi, Bengaluru" },
  { zone: "Asia/Dhaka", label: "Dhaka, Almaty" },
  { zone: "Asia/Bangkok", label: "Bangkok, Jakarta, Hanoi" },
  { zone: "Asia/Shanghai", label: "Beijing, Shanghai, Hong Kong, Taipei" },
  { zone: "Asia/Singapore", label: "Singapore, Kuala Lumpur, Manila, Perth" },
  { zone: "Asia/Tokyo", label: "Tokyo, Seoul" },
  { zone: "Australia/Sydney", label: "Sydney, Melbourne, Canberra" },
  { zone: "Australia/Brisbane", label: "Brisbane" },
  { zone: "Pacific/Auckland", label: "Auckland, Wellington" },
];

/** The zone's official offset at `now`, e.g. "GMT−05:00" (a real minus sign). */
export function gmtOffset(zone: string, now: Date): string {
  const part = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "longOffset" })
    .formatToParts(now)
    .find((p) => p.type === "timeZoneName")?.value;
  const offset = !part || part === "GMT" ? "GMT+00:00" : part;
  return offset.replace("-", "−");
}

/** Minutes ahead of GMT, for sorting: "GMT−05:00" -> -300. */
function offsetMinutes(offset: string): number {
  const m = /GMT([+−])(\d\d):(\d\d)/.exec(offset);
  if (!m) return 0;
  const minutes = Number(m[2]) * 60 + Number(m[3]);
  return m[1] === "−" ? -minutes : minutes;
}

/**
 * Menu options, west to east: "GMT−05:00 · Central Time: Chicago, Dallas, Winnipeg".
 * A saved zone that isn't in the list (e.g. "Europe/Vienna") is added so it still shows.
 */
export function zoneOptions(now: Date, saved?: string | null): { value: string; label: string }[] {
  const zones = [...COMMON_ZONES];
  if (saved && !zones.some((z) => z.zone === saved)) zones.push({ zone: saved, label: saved.replaceAll("_", " ") });
  return zones
    .map((z) => ({ value: z.zone, offset: gmtOffset(z.zone, now), label: z.label }))
    .sort((a, b) => offsetMinutes(a.offset) - offsetMinutes(b.offset) || a.label.localeCompare(b.label))
    .map((z) => ({ value: z.value, label: `${z.offset} · ${z.label}` }));
}
