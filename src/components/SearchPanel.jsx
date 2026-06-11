import React from 'react';

const RADIUS_OPTIONS = [10, 25, 50, 100];

export default function SearchPanel({ config, onChange, onSearch, loading }) {
  const idx = RADIUS_OPTIONS.indexOf(config.radius);
  const sliderIndex = idx === -1 ? 1 : idx;

  return (
    <div className="rounded-2xl p-5 mb-5"
      style={{ background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)' }}>

      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-4 rounded-full" style={{ background: '#007AFF' }} />
        <h2 className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#6E6E73' }}>
          Suche konfigurieren
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {/* Branche */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#6E6E73' }}>
            Branche / Industrie
          </label>
          <input
            type="text"
            value={config.branche}
            onChange={(e) => onChange({ branche: e.target.value })}
            placeholder="z.B. Elektriker, Zahnarzt …"
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
            style={{ background: '#F5F5F7', border: '1.5px solid #E5E5EA', color: '#1D1D1F' }}
            onFocus={(e) => (e.target.style.borderColor = '#007AFF')}
            onBlur={(e) => (e.target.style.borderColor = '#E5E5EA')}
          />
        </div>

        {/* Region */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#6E6E73' }}>
            Region / Stadt
          </label>
          <input
            type="text"
            value={config.region}
            onChange={(e) => onChange({ region: e.target.value })}
            placeholder="z.B. Trier, München …"
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
            style={{ background: '#F5F5F7', border: '1.5px solid #E5E5EA', color: '#1D1D1F' }}
            onFocus={(e) => (e.target.style.borderColor = '#007AFF')}
            onBlur={(e) => (e.target.style.borderColor = '#E5E5EA')}
          />
        </div>

        {/* Radius Slider */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#6E6E73' }}>
            Umkreis:{' '}
            <span className="font-semibold" style={{ color: '#007AFF' }}>
              {config.radius} km
            </span>
          </label>
          <div className="pt-1">
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={sliderIndex}
              onChange={(e) => onChange({ radius: RADIUS_OPTIONS[parseInt(e.target.value)] })}
            />
            <div className="relative mt-1" style={{ height: '16px' }}>
              {RADIUS_OPTIONS.map((km, i) => (
                <span
                  key={km}
                  className="absolute text-xs"
                  style={{
                    left:      i === 0 ? 0 : i === 3 ? 'auto' : `${(i / 3) * 100}%`,
                    right:     i === 3 ? 0 : 'auto',
                    transform: i > 0 && i < 3 ? 'translateX(-50%)' : 'none',
                    color:     i === sliderIndex ? '#007AFF' : '#C7C7CC',
                    fontWeight: i === sliderIndex ? 600 : 400,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {km} km
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onSearch}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={{
          background: loading ? '#C7C7CC' : '#007AFF',
          color: '#FFFFFF',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 2px 8px rgba(0,122,255,0.3)',
        }}
      >
        {loading ? (
          <>
            <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 70" />
            </svg>
            Wird geladen …
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            Recherche starten
          </>
        )}
      </button>
    </div>
  );
}
