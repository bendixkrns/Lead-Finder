import React from 'react';
import { priorityColor, priorityBg } from '../utils/scoring';

export default function PriorityBadge({ priority }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide"
      style={{ color: priorityColor(priority), background: priorityBg(priority) }}
    >
      {priority}
    </span>
  );
}
