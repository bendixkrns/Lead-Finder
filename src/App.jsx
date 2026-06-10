import React, { useState, useMemo, useReducer, useCallback } from 'react';
import { RAW_BUSINESSES } from './data/mockData';
import { enrichBusiness } from './utils/scoring';
import { exportCSV } from './utils/export';
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

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };

// ─── Stats bar ─────────────────────────────────────────────────────────────
function StatsBar({ businesses }) {
  const stats = useMemo(() => {
    const high = businesses.filter((b) => b.priorität === 'HIGH').length;
    const medium = businesses.filter((b) => b.priorität === 'MEDIUM').length;
    const low = businesses.filter((b) => b.priorität === 'LOW').length;
    const noSite = businesses.filter((b) => !b.website).length;
    const avgScore = businesses
      .filter((b) => b.gesamtScore !== null)
      .reduce((sum, b, _, arr) => sum + b.gesamtScore / arr.length, 0);
    return { high, medium, low, noSite, avgScore: Math.round(avgScore * 10) / 10 };
  }, [businesses]);

  const tiles = [
    { label: 'HIGH Leads', value: stats.high, color: '#FF4D6D', bg: 'rgba(255,77,109,0.1)' },
    { label: 'MEDIUM Leads', value: stats.medium, color: '#FFB347', bg: 'rgba(255,179,71,0.1)' },
    { label: 'LOW Leads', value: stats.low, color: '#4ECDC4', bg: 'rgba(78,205,196,0.1)' },
    { label: 'Ohne Website', value: stats.noSite, color: '#FF4D6D', bg: 'rgba(255,77,109,0.08)' },
    { label: 'Ø Score', value: stats.avgScore || '–', color: '#6C63FF', bg: 'rgba(108,99,255,0.1)' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      {tiles.map(({ label, value, color, bg }) => (
        <div
          key={label}
          className="rounded-xl p-3 text-center"
          style={{ background: bg, border: `1px solid ${color}22` }}
        >
          <div className="text-2xl font-bold mb-0.5" style={{ color }}>
            {value}
          </div>
          <div className="text-xs" style={{ color: '#8B8FA8' }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────
function EmptyState({ hasFilters, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3" style={{ color: '#5A5E78' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: '#8B8FA8' }}>
        {hasFilters ? 'Keine Ergebnisse für diese Filter' : 'Keine Leads geladen'}
      </p>
      {hasFilters && (
        <button
          onClick={onReset}
          className="mt-3 text-xs px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(108,99,255,0.15)', color: '#6C63FF', border: '1px solid rgba(108,99,255,0.3)' }}
        >
          Filter zurücksetzen
        </button>
      )}
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [searchConfig, setSearchConfig] = useState({ branche: '', region: 'Trier', radius: 25 });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [businesses, dispatch] = useReducer(businessReducer, [], () =>
    RAW_BUSINESSES.map(enrichBusiness)
  );
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(true); // show mock data on load

  const handleConfigChange = useCallback((patch) => {
    setSearchConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleFilterChange = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleSearch = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      dispatch({ type: 'LOAD', businesses: RAW_BUSINESSES.map(enrichBusiness) });
      setSearched(true);
      setFilters(DEFAULT_FILTERS);
      setLoading(false);
    }, 900);
  }, []);

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
    <div className="min-h-screen" style={{ background: '#0F1117' }}>
      {/* Top nav */}
      <header
        className="sticky top-0 z-40 px-6 py-3 flex items-center justify-between"
        style={{ background: 'rgba(15,17,23,0.95)', borderBottom: '1px solid #2A2D3E', backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.4)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight" style={{ color: '#E8E8F0' }}>
            Lead<span style={{ color: '#6C63FF' }}>Finder</span>
          </span>
          <span
            className="px-2 py-0.5 rounded text-xs font-medium"
            style={{ background: 'rgba(108,99,255,0.12)', color: '#6C63FF', border: '1px solid rgba(108,99,255,0.2)' }}
          >
            Demo
          </span>
        </div>

        <div className="flex items-center gap-2">
          {searched && (
            <button
              onClick={() => exportCSV(visibleBusinesses)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: '#21253A', color: '#8B8FA8', border: '1px solid #2A2D3E' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6C63FF'; e.currentTarget.style.color = '#6C63FF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2D3E'; e.currentTarget.style.color = '#8B8FA8'; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              CSV Export
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Demo banner */}
        <div
          className="rounded-lg px-4 py-2.5 mb-5 flex items-start gap-2.5 text-xs"
          style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2" className="mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span style={{ color: '#8B8FA8' }}>
            <span style={{ color: '#6C63FF', fontWeight: 600 }}>Demo-Modus:</span>{' '}
            Zeigt Beispieldaten für die Region Trier. Für echte Daten: Backend-Integration mit
            Google Places API + PageSpeed Insights API erforderlich.
          </span>
        </div>

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#E8E8F0' }}>
            Business Intelligence
          </h1>
          <p className="text-sm" style={{ color: '#8B8FA8' }}>
            Identifiziere lokale Unternehmen mit Web-Potenzial und priorisiere deine Akquise.
          </p>
        </div>

        {/* Search */}
        <SearchPanel
          config={searchConfig}
          onChange={handleConfigChange}
          onSearch={handleSearch}
          loading={loading}
        />

        {/* Results */}
        {searched && (
          <>
            <StatsBar businesses={businesses} />

            <div
              className="rounded-xl p-4 mb-4"
              style={{ background: '#1A1D27', border: '1px solid #2A2D3E' }}
            >
              <FilterBar
                filters={filters}
                onChange={handleFilterChange}
                resultCount={visibleBusinesses.length}
                totalCount={businesses.length}
              />
            </div>

            {visibleBusinesses.length === 0 ? (
              <EmptyState hasFilters={hasFilters} onReset={handleResetFilters} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {visibleBusinesses.map((b) => (
                  <BusinessCard
                    key={b.id}
                    business={b}
                    onClick={() => setSelected(b.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Detail modal */}
      {selectedBusiness && (
        <DetailModal
          business={selectedBusiness}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
