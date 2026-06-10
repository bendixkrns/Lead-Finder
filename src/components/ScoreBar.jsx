import React from 'react';
import { scoreColor } from '../utils/scoring';

export default function ScoreBar({ label, score, weight, maxScore = 10 }) {
  const pct = Math.round((score / maxScore) * 100);
  const color = scoreColor(score);

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium" style={{ color: '#8B8FA8' }}>
          {label}
          <span className="ml-1 text-xs" style={{ color: '#5A5E78' }}>
            ({Math.round(weight * 100)}%)
          </span>
        </span>
        <span className="text-sm font-semibold" style={{ color }}>
          {score}/10
        </span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: '#2A2D3E' }}>
        <div
          className="h-1.5 rounded-full score-bar"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
