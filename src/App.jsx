import React, { useState, useMemo, useReducer, useCallback } from 'react';
import { RAW_BUSINESSES } from './data/mockData';
import { enrichBusiness } from './utils/scoring';
import { exportCSV, exportExcel } from './utils/export';
import SearchPanel from './components/SearchPanel';
import FilterBar from './components/FilterBar';
import BusinessCard from './components/BusinessCard';
import DetailModal from './components/DetailModal';

// ─── Business state reducer ────────────────────────────────────────────────
function businessReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return action.businesses;
    case 'UPDATE':
      return state.map((b) =>
        b.id === action.id ? { ...b, ...action.patch } : b
      );
    default:
      return state;
  }
}

// ─── Default filters ────────────────────────────────────────────────────────
const DEFAULT_FILTERS = {
  search: '',
  priority: 'Alle',
  website: 'Alle',
  sort: 'priorität',
  sortDir: 'asc',
};

const PRIORITY_ORDER = { HOCH: 0, MITTEL: 1, NIEDRIG: 2 };

// ─── Stats bar ─────────────────────────────────────────────────────────────
function StatsBar({ businesses }) {
  const stats = useMemo(() => {
    const hoch = businesses.filter((b) => b.priorität === 'HOCH').length;
    const mittel = businesses.filter((b) => b.priorität === 'MITTEL').length;
    const niedrig = businesses.filter((b) => b.priorität === 'NIEDRIG').length;
    const noSite = businesses.filter((b) => !b.website).length;
    const avgScore = businesses
      .filter((b) => b.gesamtScore !== null)
      .reduce((sum, b, _, arr) => sum + b.gesamtScore / arr.length, 0);
    return { hoch, mittel, niedrig, noSite, avgScore: Math.round(avgScore * 10) / 10 };
  }, [businesses]);

  const tiles = [
    { label: 'Hohe Priorität', value: stats.hoch, color: '#FF3B30', bg: 'rgba(255,59,48,0.06)' },
    { label: 'Mittlere Priorität', value: stats.mittel, color: '#FF9500', bg: 'rgba(255,149,0,0.06)' },
    { label: 'Niedrige Priorität', value: stats.niedrig, color: '#34C759', bg: 'rgba(52,199,89,0.06)' },
    { label: 'Ohne Website', value: stats.noSite, color: '#FF3B30', bg: 'rgba(255,59,48,0.06)' },
    { label: 'Ø Score', value: stats.avgScore || '–', color: '#007AFF', bg: 'rgba(0,122,255,0.06)' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
      {tiles.map(({ label, value, color, bg }) => (
        <div key={label} className="rounded-2xl p-3 text-center"
          style={{ background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: `1.5px solid ${bg.replace('0.06', '0.15')}` }}>
          <div className="text-2xl font-bold mb-0.5" style={{ color }}>{value}</div>
          <div className="text-xs" style={{ color: '#6E6E73' }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────
function EmptyState({ hasFilters, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3" style={{ color: '#C7C7CC' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: '#6E6E73' }}>
        {hasFilters ? 'Keine Ergebnisse für diese Filter' : 'Keine Leads geladen'}
      </p>
      {hasFilters && (
        <button onClick={onReset} className="mt-3 text-xs px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(0,122,255,0.08)', color: '#007AFF', border: '1.5px solid rgba(0,122,255,0.2)' }}>
          Filter zurücksetzen
        </button>
      )}
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [searchConfig, setSearchConfig] = useState({ branche: '', region: 'Trier', radius: 25, limit: 50 });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [businesses, dispatch] = useReducer(businessReducer, [], () =>
    RAW_BUSINESSES.map(enrichBusiness)
  );
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(true); // show mock data on load
  const [isLive, setIsLive] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [searchMeta, setSearchMeta] = useState(null); // { sources, duplicatesRemoved }

  const handleConfigChange = useCallback((patch) => {
    setSearchConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleFilterChange = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchConfig),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const { businesses: raw, sources, duplicatesRemoved } = await res.json();
      dispatch({ type: 'LOAD', businesses: raw.map(enrichBusiness) });
      setIsLive(true);
      setSearched(true);
      setFilters(DEFAULT_FILTERS);
      setSearchMeta({ sources: sources ?? [], duplicatesRemoved: duplicatesRemoved ?? 0 });
    } catch (err) {
      setApiError(err.message);
      // Fall back to mock data so the UI is still usable
      dispatch({ type: 'LOAD', businesses: RAW_BUSINESSES.map(enrichBusiness) });
      setIsLive(false);
      setSearched(true);
      setFilters(DEFAULT_FILTERS);
    } finally {
      setLoading(false);
    }
  }, [searchConfig]);

  const handleUpdate = useCallback((id, patch) => {
    dispatch({ type: 'UPDATE', id, patch });
  }, []);

  const handleResetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  // ── Filter + sort ──────────────────────────────────────────────────────
  const visibleBusinesses = useMemo(() => {
    let result = [...businesses];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((b) => b.firma.toLowerCase().includes(q));
    }
    if (filters.priority !== 'Alle') {
      result = result.filter((b) => b.priorität === filters.priority);
    }
    if (filters.website === 'Ja') result = result.filter((b) => !!b.website);
    if (filters.website === 'Nein') result = result.filter((b) => !b.website);

    result.sort((a, b) => {
      let valA, valB;
      if (filters.sort === 'gesamtScore') {
        valA = a.gesamtScore ?? -1;
        valB = b.gesamtScore ?? -1;
      } else if (filters.sort === 'googleBewertung') {
        valA = a.googleBewertung;
        valB = b.googleBewertung;
      } else if (filters.sort === 'firma') {
        valA = a.firma.toLowerCase();
        valB = b.firma.toLowerCase();
      } else if (filters.sort === 'priorität') {
        valA = PRIORITY_ORDER[a.priorität];
        valB = PRIORITY_ORDER[b.priorität];
      }
      if (valA < valB) return filters.sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return filters.sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [businesses, filters]);

  const hasFilters =
    filters.search !== '' ||
    filters.priority !== 'Alle' ||
    filters.website !== 'Alle';

  const selectedBusiness = useMemo(
    () => selected !== null ? businesses.find((b) => b.id === selected) : null,
    [selected, businesses]
  );

  return (
    <div className="min-h-screen" style={{ background: '#F5F5F7' }}>
      {/* Top nav */}
      <header className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between"
        style={{ background: 'rgba(255,255,255,0.85)', borderBottom: '1px solid #E5E5EA', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(0,122,255,0.1)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight" style={{ color: '#1D1D1F' }}>
            Lead<span style={{ color: '#007AFF' }}>Finder</span>
          </span>
          <span className="px-2 py-0.5 rounded-md text-xs font-medium"
            style={{ background: 'rgba(0,122,255,0.08)', color: '#007AFF' }}>
            {isLive ? 'Live' : 'Demo'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {searched && (
            <div className="flex gap-1.5">
              <button onClick={() => exportExcel(visibleBusinesses)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{ background: '#F5F5F7', color: '#6E6E73', border: '1.5px solid #E5E5EA' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#34C759'; e.currentTarget.style.color = '#34C759'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E5EA'; e.currentTarget.style.color = '#6E6E73'; }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Excel
              </button>
              <button onClick={() => exportCSV(visibleBusinesses)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{ background: '#F5F5F7', color: '#6E6E73', border: '1.5px solid #E5E5EA' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#007AFF'; e.currentTarget.style.color = '#007AFF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E5EA'; e.currentTarget.style.color = '#6E6E73'; }}>
                CSV
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Status banner */}
        <div className="rounded-2xl px-4 py-3 mb-5 flex items-start gap-2.5 text-xs"
          style={{
            background: isLive ? 'rgba(52,199,89,0.06)' : 'rgba(0,122,255,0.06)',
            border: `1.5px solid ${isLive ? 'rgba(52,199,89,0.2)' : 'rgba(0,122,255,0.15)'}`,
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={isLive ? '#34C759' : '#007AFF'} strokeWidth="2" className="mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{ color: '#6E6E73' }}>
            {isLive ? (
              <><span style={{ color: '#34C759', fontWeight: 600 }}>Live-Modus:</span>{' '}
              {searchMeta?.sources?.join(' + ') ?? 'Apify'} · Website-Scores in Echtzeit
              {searchMeta?.duplicatesRemoved > 0 && <> · <span style={{ color: '#34C759' }}>{searchMeta.duplicatesRemoved} Duplikat{searchMeta.duplicatesRemoved > 1 ? 'e' : ''} zusammengeführt</span></>}
              </>
            ) : (
              <><span style={{ color: '#007AFF', fontWeight: 600 }}>Demo-Modus:</span>{' '}
              Beispieldaten für die Region Trier. Branche und Region eingeben, dann auf Suchen klicken — echte Daten werden live geladen.</>

            )}
          </span>
        </div>

        {/* API error */}
        {apiError && (
          <div className="rounded-2xl px-4 py-3 mb-4 flex items-start gap-2.5 text-xs"
            style={{ background: 'rgba(255,59,48,0.06)', border: '1.5px solid rgba(255,59,48,0.2)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#FF3B30" strokeWidth="2" className="mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={{ color: '#FF3B30' }}>
              <span style={{ fontWeight: 600 }}>Fehler:</span> {apiError} — Demo-Daten werden angezeigt.
            </span>
          </div>
        )}

        {/* Page title */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#1D1D1F' }}>
            Lead-Recherche
          </h1>
          <p className="text-sm" style={{ color: '#6E6E73' }}>
            Lokale Unternehmen mit Web-Potenzial finden und priorisieren.
          </p>
        </div>

        <SearchPanel config={searchConfig} onChange={handleConfigChange}
          onSearch={handleSearch} loading={loading} />

        {searched && (
          <>
            <StatsBar businesses={businesses} />

            <div className="rounded-2xl p-4 mb-4"
              style={{ background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
              <FilterBar filters={filters} onChange={handleFilterChange}
                resultCount={visibleBusinesses.length} totalCount={businesses.length} />
            </div>

            {visibleBusinesses.length === 0 ? (
              <EmptyState hasFilters={hasFilters} onReset={handleResetFilters} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {visibleBusinesses.map((b) => (
                  <BusinessCard key={b.id} business={b} onClick={() => setSelected(b.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {selectedBusiness && (
        <DetailModal business={selectedBusiness}
          onClose={() => setSelected(null)} onUpdate={handleUpdate} />
      )}
    </div>
  );
}
