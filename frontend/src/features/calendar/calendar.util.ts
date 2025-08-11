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
  const pct = (maxCount / total) * 100;
  if (pct === 0) return 'bg-primary/0';
  if (pct <= 20) return 'bg-primary/10';
  if (pct <= 40) return 'bg-primary/30';
  if (pct <= 60) return 'bg-primary/50';
  if (pct <= 80) return 'bg-primary/70 text-white';
  return 'bg-primary/100 text-white';
};
