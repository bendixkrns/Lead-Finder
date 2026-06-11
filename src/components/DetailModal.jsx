import React, { useState, useEffect } from 'react';
import ScoreBar from './ScoreBar';
import ScoreRing from './ScoreRing';
import PriorityBadge from './PriorityBadge';

const SCORE_CATEGORIES = [
  { key: 'modernität', label: 'Modernität', weight: 0.30 },
  { key: 'mobile', label: 'Mobile-Freundlichkeit', weight: 0.25 },
  { key: 'performance', label: 'Performance', weight: 0.20 },
  { key: 'technik', label: 'Technische Basis', weight: 0.15 },
  { key: 'conversion', label: 'Conversion', weight: 0.10 },
];

export default function DetailModal({ business, onClose, onUpdate }) {
  const [notes, setNotes] = useState(business.notizen || '');
  const [kontaktiert, setKontaktiert] = useState(business.kontaktiert || false);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = () => {
    onUpdate(business.id, { notizen: notes, kontaktiert });
    onClose();
  };

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="modal-content w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: '#FFFFFF', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 sticky top-0 z-10"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #F2F2F7' }}>
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-lg font-bold" style={{ color: '#1D1D1F' }}>{business.firma}</h2>
              <PriorityBadge priority={business.priorität} />
            </div>
            <p className="text-sm" style={{ color: '#6E6E73' }}>
              {business.branche ? `${business.branche} · ` : ''}{business.adresse}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <ScoreRing score={business.gesamtScore} size={52} />
            <button onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#6E6E73', background: '#F5F5F7' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Kontaktdaten */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Telefon', value: business.telefon },
              { label: 'E-Mail', value: business.email },
              { label: 'Website', value: business.website },
              { label: 'Google-Bewertung', value: business.googleBewertung ? `${business.googleBewertung} ★ (${business.anzahlBewertungen})` : null },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl p-3" style={{ background: '#F5F5F7' }}>
                <div className="text-xs mb-0.5" style={{ color: '#C7C7CC' }}>{label}</div>
                <div className="text-sm font-medium truncate" style={{ color: value ? '#1D1D1F' : '#C7C7CC' }}>
                  {value || '–'}
                </div>
              </div>
            ))}
          </div>

          {/* Website Preview Placeholder */}
          {business.website && (
            <div>
              <h3 className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#C7C7CC' }}>
                Website-Vorschau
              </h3>
              <div className="rounded-xl flex items-center justify-center"
                style={{ background: '#F5F5F7', height: 140 }}>
                <div className="text-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="1.5" className="mx-auto mb-2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
                  </svg>
                  <a href={business.website} target="_blank" rel="noopener noreferrer"
                    className="text-xs" style={{ color: '#007AFF' }}>
                    {business.website}
                  </a>
                  <p className="text-xs mt-1" style={{ color: '#C7C7CC' }}>
                    Vorschau erfordert Backend-Integration
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Score-Aufschlüsselung */}
          {business.rawScores ? (
            <div>
              <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#C7C7CC' }}>
                Score-Aufschlüsselung
              </h3>
              <div className="rounded-xl p-4" style={{ background: '#F5F5F7' }}>
                {SCORE_CATEGORIES.map((cat) => (
                  <ScoreBar key={cat.key} label={cat.label}
                    score={business.rawScores[cat.key]} weight={cat.weight} />
                ))}
                <div className="flex justify-between items-center pt-2 mt-1"
                  style={{ borderTop: '1px solid #E5E5EA' }}>
                  <span className="text-xs font-semibold" style={{ color: '#6E6E73' }}>Gesamt-Score</span>
                  <span className="text-base font-bold" style={{ color: '#1D1D1F' }}>
                    {business.gesamtScore}/10
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl p-4 text-center" style={{ background: '#F5F5F7' }}>
              <p className="text-sm" style={{ color: '#C7C7CC' }}>
                Kein Website-Score — Priorität: Keine Website vorhanden
              </p>
            </div>
          )}

          {/* Notizen */}
          <div>
            <h3 className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#C7C7CC' }}>
              Notizen
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Eigene Notizen zu diesem Lead …"
              rows={3}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition-all"
              style={{ background: '#F5F5F7', border: '1.5px solid #E5E5EA', color: '#1D1D1F' }}
              onFocus={(e) => (e.target.style.borderColor = '#007AFF')}
              onBlur={(e) => (e.target.style.borderColor = '#E5E5EA')}
            />
          </div>

          {/* Aktionen */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={() => setKontaktiert(!kontaktiert)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: kontaktiert ? 'rgba(0,122,255,0.08)' : '#F5F5F7',
                border: `1.5px solid ${kontaktiert ? '#007AFF' : '#E5E5EA'}`,
                color: kontaktiert ? '#007AFF' : '#6E6E73',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                {kontaktiert ? <path d="M20 6L9 17l-5-5" /> : <circle cx="12" cy="12" r="10" />}
              </svg>
              {kontaktiert ? 'Kontaktiert ✓' : 'Als kontaktiert markieren'}
            </button>
            <div className="flex gap-2">
              <button onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{ background: '#F5F5F7', color: '#6E6E73', border: '1.5px solid #E5E5EA' }}>
                Abbrechen
              </button>
              <button onClick={handleSave}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: '#007AFF', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,122,255,0.3)' }}>
                Speichern
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
