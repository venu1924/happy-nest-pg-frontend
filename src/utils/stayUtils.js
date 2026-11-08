/** Whole days from today until the last stay date. Negative means the stay is over. */
function daysUntilCheckout(checkoutDate) {
  if (!checkoutDate) return null;
  const [year, month, day] = String(checkoutDate).slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;
  const checkout = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  checkout.setHours(0, 0, 0, 0);
  return Math.round((checkout.getTime() - today.getTime()) / 86400000);
}

/**
 * Remaining stay days, including today.
 * A 10-day booking shows "10 days left" on day 1, "9 days left" the next day, then "Vacate today" on the last day.
 */
export function stayCountdown(stay) {
  const untilLast =
    stay?.checkoutDate != null ? daysUntilCheckout(stay.checkoutDate) : Number(stay?.daysLeft);
  if (untilLast == null || Number.isNaN(untilLast)) return '';
  if (untilLast < 0) return 'Stay ended — vacate';
  if (untilLast === 0 || stay?.vacateToday) return 'Vacate today';
  const left = untilLast + 1;
  return left === 1 ? '1 day left' : `${left} days left`;
}
