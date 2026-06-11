import React, { useState, useEffect, useRef } from 'react';

const RADIUS_OPTIONS = [10, 25, 50, 100];
const PLZ_API = 'https://openplzapi.org/de/Localities';

// ─── PLZ Autocomplete ────────────────────────────────────────────────────────
function RegionAutocomplete({ value, onChange }) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // Sync if parent resets the value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  function handleInput(e) {
    let q = e.target.value;

    // PLZ mode: digits only, max 5 chars
    if (/^\d/.test(q)) {
      q = q.replace(/\D/g, '').slice(0, 5);
    }

    setQuery(q);
    onChange({ region: q });

    clearTimeout(debounceRef.current);

    if (q.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const isPlz = /^\d/.test(q);
        const param = isPlz ? `postalCode=${encodeURIComponent(q)}` : `name=${encodeURIComponent(q)}`;
        const res = await fetch(`${PLZ_API}?${param}&page=1&pageSize=8`);
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
        setActiveIdx(-1);
        setOpen(Array.isArray(data) && data.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, 250);
  }

  function selectSuggestion(item) {
    const formatted = `${item.postalCode} ${item.name}`;
    setQuery(formatted);
    onChange({ region: formatted });
    setSuggestions([]);
    setOpen(false);
  }

  function handleKeyDown(e) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#6E6E73' }}>
        Region / Stadt
      </label>
      <input
        type="text"
        value={query}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="PLZ oder Stadt …"
        autoComplete="off"
        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
        style={{
          background: '#F5F5F7',
          border: `1.5px solid ${open ? '#007AFF' : '#E5E5EA'}`,
          color: '#1D1D1F',
        }}
      />
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            border: '1.5px solid #E5E5EA',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {suggestions.map((item, i) => (
            <div
              key={`${item.postalCode}-${item.name}-${i}`}
              onMouseDown={() => selectSuggestion(item)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                background: i === activeIdx ? 'rgba(0,122,255,0.08)' : 'transparent',
                borderBottom: i < suggestions.length - 1 ? '1px solid #F5F5F7' : 'none',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#007AFF', fontWeight: 600, fontSize: '13px', minWidth: '46px' }}>
                {item.postalCode}
              </span>
              <span style={{ color: '#1D1D1F', fontSize: '13px' }}>{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SearchPanel ─────────────────────────────────────────────────────────────
export default function SearchPanel({ config, onChange, onSearch, loading }) {
  const idx = RADIUS_OPTIONS.indexOf(config.radius);
  const sliderIndex = idx === -1 ? 1 : idx;

  return (
    <div
      className="rounded-2xl p-5 mb-5"
      style={{ background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)' }}
    >
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
            Branche <span style={{ fontWeight: 400, color: '#AEAEB2' }}>(optional)</span>
          </label>
          <input
            type="text"
            value={config.branche}
            onChange={(e) => onChange({ branche: e.target.value })}
            placeholder="z.B. Elektriker — oder leer lassen"
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
            style={{ background: '#F5F5F7', border: '1.5px solid #E5E5EA', color: '#1D1D1F' }}
            onFocus={(e) => (e.target.style.borderColor = '#007AFF')}
            onBlur={(e) => (e.target.style.borderColor = '#E5E5EA')}
          />
        </div>

        {/* Region mit Autocomplete */}
        <RegionAutocomplete value={config.region} onChange={onChange} />

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
                    left: i === 0 ? 0 : i === 3 ? 'auto' : `${(i / 3) * 100}%`,
                    right: i === 3 ? 0 : 'auto',
                    transform: i > 0 && i < 3 ? 'translateX(-50%)' : 'none',
                    color: i === sliderIndex ? '#007AFF' : '#C7C7CC',
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
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Recherche starten
          </>
        )}
      </button>
    </div>
  );
}
