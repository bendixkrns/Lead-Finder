import React from 'react';

const RADIUS_OPTIONS = [10, 25, 50];

export default function SearchPanel({ config, onChange, onSearch, loading }) {
  return (
    <div
      className="rounded-xl p-5 mb-6"
      style={{ background: '#1A1D27', border: '1px solid #2A2D3E' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-4 rounded-full" style={{ background: '#6C63FF' }} />
        <h2 className="text-sm font-semibold tracking-wide" style={{ color: '#8B8FA8' }}>
          SUCHE KONFIGURIEREN
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {/* Industry */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#8B8FA8' }}>
            Branche / Industrie
          </label>
          <input
            type="text"
            value={config.branche}
            onChange={(e) => onChange({ branche: e.target.value })}
            placeholder="z.B. Elektriker, Zahnarzt…"
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
            style={{
              background: '#0F1117',
              border: '1px solid #2A2D3E',
              color: '#E8E8F0',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#6C63FF')}
            onBlur={(e) => (e.target.style.borderColor = '#2A2D3E')}
          />
        </div>

        {/* Region */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#8B8FA8' }}>
            Region / Stadt
          </label>
          <input
            type="text"
            value={config.region}
            onChange={(e) => onChange({ region: e.target.value })}
            placeholder="z.B. Trier, Köln…"
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
            style={{
              background: '#0F1117',
              border: '1px solid #2A2D3E',
              color: '#E8E8F0',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#6C63FF')}
            onBlur={(e) => (e.target.style.borderColor = '#2A2D3E')}
          />
        </div>

        {/* Radius */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#8B8FA8' }}>
            Radius: <span style={{ color: '#E8E8F0' }}>{config.radius} km</span>
          </label>
          <div className="flex gap-2">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => onChange({ radius: r })}
                className="flex-1 rounded-lg py-2.5 text-sm font-medium transition-all"
                style={{
                  background: config.radius === r ? 'rgba(108,99,255,0.2)' : '#0F1117',
                  border: `1px solid ${config.radius === r ? '#6C63FF' : '#2A2D3E'}`,
                  color: config.radius === r ? '#6C63FF' : '#8B8FA8',
                }}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onSearch}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
        style={{
          background: loading ? '#3A3D52' : '#6C63FF',
          color: loading ? '#8B8FA8' : '#ffffff',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? (
          <>
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
            </svg>
            Wird geladen…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            Recherche starten
          </>
        )}
      </button>
    </div>
  );
}
