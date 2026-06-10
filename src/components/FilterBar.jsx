import React from 'react';

const PRIORITY_OPTS = ['Alle', 'HIGH', 'MEDIUM', 'LOW'];
const WEBSITE_OPTS = ['Alle', 'Ja', 'Nein'];
const SORT_OPTS = [
  { value: 'gesamtScore', label: 'Score' },
  { value: 'googleBewertung', label: 'Google' },
  { value: 'firma', label: 'Name' },
  { value: 'priorität', label: 'Priorität' },
];

function Chip({ active, onClick, children, color }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{
        background: active ? (color || 'rgba(108,99,255,0.2)') : '#0F1117',
        border: `1px solid ${active ? (color ? color.replace('0.2', '0.6') : '#6C63FF') : '#2A2D3E'}`,
        color: active ? (color ? color.replace('rgba(', '').replace('0.2)', '') : '#6C63FF') : '#8B8FA8',
      }}
    >
      {children}
    </button>
  );
}

export default function FilterBar({ filters, onChange, resultCount, totalCount }) {
  const priorityColors = {
    HIGH: 'rgba(255,77,109,0.2)',
    MEDIUM: 'rgba(255,179,71,0.2)',
    LOW: 'rgba(78,205,196,0.2)',
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2"
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#5A5E78" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Name suchen…"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          className="pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none transition-all w-44"
          style={{
            background: '#0F1117',
            border: '1px solid #2A2D3E',
            color: '#E8E8F0',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#6C63FF')}
          onBlur={(e) => (e.target.style.borderColor = '#2A2D3E')}
        />
      </div>

      <div className="h-4 w-px" style={{ background: '#2A2D3E' }} />

      {/* Priority */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs" style={{ color: '#5A5E78' }}>Priorität:</span>
        {PRIORITY_OPTS.map((p) => (
          <Chip
            key={p}
            active={filters.priority === p}
            onClick={() => onChange({ priority: p })}
            color={p !== 'Alle' ? priorityColors[p] : undefined}
          >
            {p}
          </Chip>
        ))}
      </div>

      <div className="h-4 w-px" style={{ background: '#2A2D3E' }} />

      {/* Website */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs" style={{ color: '#5A5E78' }}>Website:</span>
        {WEBSITE_OPTS.map((w) => (
          <Chip key={w} active={filters.website === w} onClick={() => onChange({ website: w })}>
            {w}
          </Chip>
        ))}
      </div>

      <div className="h-4 w-px" style={{ background: '#2A2D3E' }} />

      {/* Sort */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs" style={{ color: '#5A5E78' }}>Sortieren:</span>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value })}
          className="rounded-lg px-2.5 py-1.5 text-xs outline-none"
          style={{
            background: '#0F1117',
            border: '1px solid #2A2D3E',
            color: '#E8E8F0',
          }}
        >
          {SORT_OPTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={() => onChange({ sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' })}
          className="p-1.5 rounded-lg transition-all"
          style={{ background: '#0F1117', border: '1px solid #2A2D3E', color: '#8B8FA8' }}
          title={filters.sortDir === 'asc' ? 'Aufsteigend' : 'Absteigend'}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {filters.sortDir === 'asc' ? (
              <path d="M12 5v14M5 12l7 7 7-7" />
            ) : (
              <path d="M12 19V5M5 12l7-7 7 7" />
            )}
          </svg>
        </button>
      </div>

      <div className="ml-auto text-xs" style={{ color: '#5A5E78' }}>
        {resultCount} von {totalCount} Leads
      </div>
    </div>
  );
}
