// Day change in the date navigation: the app stays open past midnight, typically
// asleep overnight. `state` is { today, selectedDate, availableDates }, `newToday`
// the current local date key. Returns `state` itself while the day is unchanged.
// A user who was looking at today moves on to the new today; a past day they chose
// stays selected. The new today is always added, so it is reachable either way.
export function applyDayChange(state, newToday) {
  if (newToday === state.today) return state;
  const availableDates = state.availableDates.includes(newToday)
    ? state.availableDates
    : [...state.availableDates, newToday].sort();
  return {
    today: newToday,
    selectedDate: state.selectedDate === state.today ? newToday : state.selectedDate,
    availableDates,
  };
}
