export const getOpacityForWeek = (count: number, total: number): string => {
  const pct = (count / total) * 100;
  if (pct === 0) return 'bg-primary/0';
  if (pct <= 20) return 'bg-primary/10';
  if (pct <= 40) return 'bg-primary/30';
  if (pct <= 60) return 'bg-primary/50';
  if (pct <= 80) return 'bg-primary/70';
  return 'bg-primary/100';
};

export const getOpacityForMonth = (maxCount: number, total: number): string => {
  const ratio = maxCount / total;
  if (ratio === 0) return 'bg-gray';
  if (ratio < 0.25) return 'bg-primary/10';
  if (ratio < 0.5) return 'bg-primary/30';
  if (ratio < 0.75) return 'bg-primary/50';
  if (ratio < 1) return 'bg-primary/70';
  return 'bg-primary/100 text-white';
};
