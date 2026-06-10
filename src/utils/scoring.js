// Weights must sum to 1.0
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
  if (!business.website) return 'HIGH';
  const score = computeScore(business.rawScores);
  if (score === null || score < 4) return 'HIGH';
  if (score <= 6) return 'MEDIUM';
  return 'LOW';
}

export function enrichBusiness(b) {
  const gesamtScore = computeScore(b.rawScores);
  const priorität = getPriority(b);
  return { ...b, gesamtScore, priorität };
}

export function scoreColor(score) {
  if (score === null) return '#FF4D6D';
  if (score < 4) return '#FF4D6D';
  if (score <= 6) return '#FFB347';
  return '#4ECDC4';
}

export function priorityColor(p) {
  if (p === 'HIGH') return '#FF4D6D';
  if (p === 'MEDIUM') return '#FFB347';
  return '#4ECDC4';
}

export function priorityBg(p) {
  if (p === 'HIGH') return 'rgba(255,77,109,0.15)';
  if (p === 'MEDIUM') return 'rgba(255,179,71,0.15)';
  return 'rgba(78,205,196,0.15)';
}
