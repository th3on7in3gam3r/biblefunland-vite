/**
 * Calendar dates in the visitor's own time zone ("YYYY-MM-DD").
 *
 * Don't use new Date().toISOString().split('T')[0] for "today": that is the UTC
 * date, which in the US rolls over to tomorrow in the evening (8 pm Eastern in
 * summer). A Saturday-night check-in was being saved as Sunday.
 */
export function localDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** The local date `n` days before `d` (n = 1 is yesterday). */
export function localDateDaysAgo(n, d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() - n);
  return localDateStr(x);
}

/** Day of the week (0 = Sunday) for a "YYYY-MM-DD" string, read as a local date. */
export function weekdayOf(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}
