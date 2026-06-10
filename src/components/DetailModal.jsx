import React, { useState, useEffect } from 'react';
import ScoreBar from './ScoreBar';
import ScoreRing from './ScoreRing';
import PriorityBadge from './PriorityBadge';
import StarRating from './StarRating';

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

  // Close on ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = () => {
    onUpdate(business.id, { notizen: notes, kontaktiert });
    onClose();
  };

  const screenshotUrl = business.website
    ? `https://api.microlink.io/?url=${encodeURIComponent(business.website)}&screenshot=true&meta=false&embed=screenshot.url`
    : null;

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="modal-content w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: '#1A1D27', border: '1px solid #2A2D3E' }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-6 pb-4 sticky top-0 z-10"
          style={{ background: '#1A1D27', borderBottom: '1px solid #2A2D3E' }}
        >
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-lg font-bold" style={{ color: '#E8E8F0' }}>
                {business.firma}
              </h2>
              <PriorityBadge priority={business.priorität} />
            </div>
            <p className="text-sm" style={{ color: '#8B8FA8' }}>{business.branche} · {business.adresse}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <ScoreRing score={business.gesamtScore} size={52} />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#8B8FA8', background: '#21253A' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Contact info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: 'phone', label: 'Telefon', value: business.telefon },
              { icon: 'mail', label: 'Email', value: business.email },
              { icon: 'globe', label: 'Website', value: business.website },
              { icon: 'star', label: 'Google Bewertung', value: business.googleBewertung ? `${business.googleBewertung} ★ (${business.anzahlBewertungen} Bewertungen)` : '–' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg p-3" style={{ background: '#0F1117', border: '1px solid #2A2D3E' }}>
                <div className="text-xs mb-0.5" style={{ color: '#5A5E78' }}>{label}</div>
                <div className="text-sm font-medium truncate" style={{ color: value ? '#E8E8F0' : '#5A5E78' }}>
                  {value || '–'}
                </div>
              </div>
            ))}
          </div>

          {/* Website screenshot placeholder */}
          {business.website && (
            <div>
              <h3 className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#8B8FA8' }}>
                Website Preview
              </h3>
              <div
                className="relative rounded-lg overflow-hidden flex items-center justify-center"
                style={{ background: '#0F1117', border: '1px solid #2A2D3E', height: 160 }}
              >
                <div className="text-center">
                  <div className="mb-2" style={{ color: '#5A5E78' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
                    </svg>
                  </div>
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs hover:underline"
                    style={{ color: '#6C63FF' }}
                  >
                    {business.website}
                  </a>
                  <p className="text-xs mt-1" style={{ color: '#5A5E78' }}>
                    Screenshot-Vorschau erfordert Backend-Integration
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Score breakdown */}
          {business.rawScores ? (
            <div>
              <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#8B8FA8' }}>
                Score-Aufschlüsselung
              </h3>
              <div className="rounded-lg p-4" style={{ background: '#0F1117', border: '1px solid #2A2D3E' }}>
                {SCORE_CATEGORIES.map((cat) => (
                  <ScoreBar
                    key={cat.key}
                    label={cat.label}
                    score={business.rawScores[cat.key]}
                    weight={cat.weight}
                  />
                ))}
                <div className="flex justify-between items-center pt-2 mt-1" style={{ borderTop: '1px solid #2A2D3E' }}>
                  <span className="text-xs font-semibold" style={{ color: '#8B8FA8' }}>GESAMT SCORE</span>
                  <span className="text-base font-bold" style={{ color: '#E8E8F0' }}>
                    {business.gesamtScore}/10
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg p-4 text-center" style={{ background: '#0F1117', border: '1px solid #2A2D3E' }}>
              <p className="text-sm" style={{ color: '#5A5E78' }}>
                Kein Website-Score verfügbar — Priorität: Keine Website vorhanden
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <h3 className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#8B8FA8' }}>
              Notizen
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Eigene Notizen zu diesem Lead…"
              rows={3}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none transition-all"
              style={{
                background: '#0F1117',
                border: '1px solid #2A2D3E',
                color: '#E8E8F0',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#6C63FF')}
              onBlur={(e) => (e.target.style.borderColor = '#2A2D3E')}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={() => setKontaktiert(!kontaktiert)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: kontaktiert ? 'rgba(108,99,255,0.2)' : '#21253A',
                border: `1px solid ${kontaktiert ? '#6C63FF' : '#2A2D3E'}`,
                color: kontaktiert ? '#6C63FF' : '#8B8FA8',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                {kontaktiert ? <path d="M20 6L9 17l-5-5" /> : <circle cx="12" cy="12" r="10" />}
              </svg>
              {kontaktiert ? 'Als kontaktiert markiert' : 'Als kontaktiert markieren'}
            </button>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: '#21253A', color: '#8B8FA8', border: '1px solid #2A2D3E' }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: '#6C63FF', color: '#ffffff' }}
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
