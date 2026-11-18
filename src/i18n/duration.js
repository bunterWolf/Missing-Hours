// Durations as the UI shows them (timeline blocks, day summary, zoom choice). Whole minutes,
// rounded down; the wording comes from the language file (timeFormats.duration*).

/**
 * @param {number|undefined} ms - Duration in milliseconds; empty or invalid counts as 0
 * @param {Function} t - i18next t function
 * @returns {string} e.g. '1h 15m' (de, en), '1時間15分' (ja)
 */
export function formatDuration(ms, t) {
  const totalMinutes = Number.isFinite(ms) ? Math.floor(ms / 60000) : 0;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0
    ? t('timeFormats.durationHoursMinutes', { hours, minutes })
    : t('timeFormats.durationMinutes', { minutes });
}
