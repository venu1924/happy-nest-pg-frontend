export function stayCountdown(stay) {
  const days = Number(stay?.daysLeft);
  if (stay?.vacateToday || days === 0) return 'Vacate today';
  if (days < 0) return 'Stay ended — vacate';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}
