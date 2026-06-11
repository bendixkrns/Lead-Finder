const WEIGHTS = {
  modernität: 0.30,
  mobile: 0.25,
  performance: 0.20,
  technik: 0.15,
  conversion: 0.10,
};

export function computeScore(rawScores) {
  if (!rawScores) return null;
  const weighted =
    rawScores.modernität * WEIGHTS.modernität +
    rawScores.mobile * WEIGHTS.mobile +
    rawScores.performance * WEIGHTS.performance +
    rawScores.technik * WEIGHTS.technik +
    rawScores.conversion * WEIGHTS.conversion;
  return Math.round(weighted * 10) / 10;
}

export function getPriority(business) {
  if (!business.website) return 'HOCH';
  const score = computeScore(business.rawScores);
  if (score === null || score < 4) return 'HOCH';
  if (score <= 6) return 'MITTEL';
  return 'NIEDRIG';
}

export function enrichBusiness(b) {
  const gesamtScore = computeScore(b.rawScores);
  const priorität = getPriority(b);
  return { ...b, gesamtScore, priorität };
}

export function scoreColor(score) {
  if (score === null) return '#FF3B30';
  if (score < 4) return '#FF3B30';
  if (score <= 6) return '#FF9500';
  return '#34C759';
}

export function priorityColor(p) {
  if (p === 'HOCH') return '#FF3B30';
  if (p === 'MITTEL') return '#FF9500';
  return '#34C759';
}

export function priorityBg(p) {
  if (p === 'HOCH') return 'rgba(255,59,48,0.1)';
  if (p === 'MITTEL') return 'rgba(255,149,0,0.1)';
  return 'rgba(52,199,89,0.1)';
}
