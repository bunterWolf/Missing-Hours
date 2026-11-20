// Sets the clock of the app's main process for the Store images: scripts/store-screenshots.js loads this
// file with -r (before the app) and MISSING_HOURS_CLOCK=<ms>. Date.now() starts there and runs on, so
// the app aggregates "today" up to that time (TimelineGenerator and AggregationManager use Date.now()).
// Not part of the app; does nothing without the variable.
const start = Number(process.env.MISSING_HOURS_CLOCK);

if (Number.isFinite(start)) {
  const realNow = Date.now;
  const offset = start - realNow();
  Date.now = () => realNow() + offset;
}
