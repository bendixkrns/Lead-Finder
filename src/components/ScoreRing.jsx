import React from 'react';
import { scoreColor } from '../utils/scoring';

export default function ScoreRing({ score, size = 52 }) {
  if (score === null) {
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
