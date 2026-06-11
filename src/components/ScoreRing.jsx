import React from 'react';
import { scoreColor } from '../utils/scoring';

export default function ScoreRing({ score, hasWebsite = false, size = 52 }) {
  if (score === null && !hasWebsite) {
    // No website at all
    return (
      <div
        className="flex items-center justify-center rounded-full font-bold"
        style={{
          width: size, height: size,
          background: 'rgba(255,59,48,0.08)',
          color: '#FF3B30',
          border: '2px solid rgba(255,59,48,0.2)',
          fontSize: size < 40 ? 9 : 11,
        }}
      >
        N/A
      </div>
    );
  }

  if (score === null && hasWebsite) {
    // Website exists but PageSpeed couldn't score it
    return (
      <div
        className="flex items-center justify-center rounded-full font-bold"
        title="Website vorhanden, aber Score nicht messbar (z.B. Bot-Schutz aktiv)"
        style={{
          width: size, height: size,
          background: 'rgba(142,142,147,0.08)',
          color: '#8E8E93',
          border: '2px dashed rgba(142,142,147,0.35)',
          fontSize: size < 40 ? 9 : 11,
        }}
      >
        ?
      </div>
    );
  }

  const color = scoreColor(score);
  const r = (size - 6) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = (score / 10) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F2F2F7" strokeWidth="3" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="font-bold relative z-10" style={{ color, fontSize: size < 40 ? 11 : 14 }}>
        {score}
      </span>
    </div>
  );
}
