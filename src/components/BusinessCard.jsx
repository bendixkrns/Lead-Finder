import React from 'react';
import PriorityBadge from './PriorityBadge';
import StarRating from './StarRating';
import ScoreRing from './ScoreRing';

export default function BusinessCard({ business, onClick }) {
  const { firma, adresse, telefon, email, website, googleBewertung, anzahlBewertungen,
    gesamtScore, priorität, kontaktiert, sources } = business;

  return (
    <div
      className="card-enter rounded-2xl p-4 cursor-pointer transition-all"
      onClick={onClick}
      style={{ background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)', border: '1px solid transparent' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1), 0 8px 24px rgba(0,122,255,0.08)';
        e.currentTarget.style.borderColor = 'rgba(0,122,255,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)';
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-semibold truncate" style={{ color: '#1D1D1F' }}>
              {firma}
            </h3>
            {sources?.length > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs"
                style={{
                  background: sources.length > 1 ? 'rgba(108,99,255,0.08)' : 'rgba(0,0,0,0.04)',
                  color: sources.length > 1 ? '#6C63FF' : '#8E8E93',
                  fontWeight: 500,
                }}>
                {sources.join('+')}
              </span>
            )}
            {kontaktiert && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs"
                style={{ background: 'rgba(0,122,255,0.08)', color: '#007AFF' }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Kontaktiert
              </span>
            )}
          </div>

          <p className="text-xs mb-2 truncate" style={{ color: '#6E6E73' }}>{adresse}</p>

          <div className="flex flex-wrap gap-3 mb-2">
            {telefon && (
              <span className="flex items-center gap-1 text-xs" style={{ color: '#6E6E73' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.02 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                {telefon}
              </span>
            )}
            {email && (
              <span className="flex items-center gap-1 text-xs truncate max-w-[160px]" style={{ color: '#6E6E73' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {email}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {website ? (
              <a href={website} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: '#007AFF' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
                </svg>
                <span className="truncate max-w-[120px]">{website.replace(/https?:\/\/(www\.)?/, '')}</span>
              </a>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
                style={{ background: 'rgba(255,59,48,0.08)', color: '#FF3B30' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Keine Website
              </span>
            )}
            {googleBewertung && <StarRating rating={googleBewertung} count={anzahlBewertungen} />}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <ScoreRing score={gesamtScore} size={48} />
          <PriorityBadge priority={priorität} />
        </div>
      </div>
    </div>
  );
}
