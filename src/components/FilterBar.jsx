import React from 'react';

const PRIORITY_OPTS = ['Alle', 'HOCH', 'MITTEL', 'NIEDRIG'];
const WEBSITE_OPTS = ['Alle', 'Ja', 'Nein'];
const SORT_OPTS = [
  { value: 'priorität', label: 'Priorität' },
  { value: 'gesamtScore', label: 'Score' },
  { value: 'googleBewertung', label: 'Bewertung' },
  { value: 'firma', label: 'Name' },
];

const PRIORITY_COLORS = {
  HOCH: { active: 'rgba(255,59,48,0.1)', border: '#FF3B30', text: '#FF3B30' },
  MITTEL: { active: 'rgba(255,149,0,0.1)', border: '#FF9500', text: '#FF9500' },
  NIEDRIG: { active: 'rgba(52,199,89,0.1)', border: '#34C759', text: '#34C759' },
};

function Chip({ active, onClick, children, pColor }) {
  const c = pColor || { active: 'rgba(0,122,255,0.1)', border: '#007AFF', text: '#007AFF' };
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
      style={{
        background: active ? c.active : 'transparent',
        border: `1.5px solid ${active ? c.border : '#E5E5EA'}`,
        color: active ? c.text : '#6E6E73',
      }}
    >
      {children}
    </button>
  );
}

export default function FilterBar({ filters, onChange, resultCount, totalCount }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Suche */}
      <div className="relative">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2"
          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Name suchen …"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          className="pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none transition-all w-40"
          style={{ background: '#F5F5F7', border: '1.5px solid #E5E5EA', color: '#1D1D1F' }}
          onFocus={(e) => (e.target.style.borderColor = '#007AFF')}
          onBlur={(e) => (e.target.style.borderColor = '#E5E5EA')}
        />
      </div>

      <div className="h-4 w-px" style={{ background: '#E5E5EA' }} />

      {/* Priorität */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs" style={{ color: '#C7C7CC' }}>Priorität:</span>
        {PRIORITY_OPTS.map((p) => (
          <Chip key={p} active={filters.priority === p} onClick={() => onChange({ priority: p })}
            pColor={PRIORITY_COLORS[p]}>
            {p}
          </Chip>
        ))}
      </div>

      <div className="h-4 w-px" style={{ background: '#E5E5EA' }} />

      {/* Website */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs" style={{ color: '#C7C7CC' }}>Website:</span>
        {WEBSITE_OPTS.map((w) => (
          <Chip key={w} active={filters.website === w} onClick={() => onChange({ website: w })}>
            {w}
          </Chip>
        ))}
      </div>

      <div className="h-4 w-px" style={{ background: '#E5E5EA' }} />

      {/* Sortierung */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs" style={{ color: '#C7C7CC' }}>Sortieren:</span>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value })}
          className="rounded-lg px-2.5 py-1.5 text-xs outline-none"
          style={{ background: '#F5F5F7', border: '1.5px solid #E5E5EA', color: '#1D1D1F' }}
        >
          {SORT_OPTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={() => onChange({ sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' })}
          className="p-1.5 rounded-lg transition-all"
          style={{ background: '#F5F5F7', border: '1.5px solid #E5E5EA', color: '#6E6E73' }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {filters.sortDir === 'asc'
              ? <path d="M12 5v14M5 12l7 7 7-7" />
              : <path d="M12 19V5M5 12l7-7 7 7" />}
          </svg>
        </button>
      </div>

      <div className="ml-auto text-xs" style={{ color: '#C7C7CC' }}>
        {resultCount} von {totalCount}
      </div>
    </div>
  );
}
