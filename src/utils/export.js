export function exportCSV(businesses) {
  const headers = [
    'Firma', 'Adresse', 'Telefon', 'Email', 'Website', 'Hat_Website',
    'Google_Bewertung', 'Anzahl_Bewertungen',
    'Score_Modernität', 'Score_Mobile', 'Score_Performance', 'Score_Technik', 'Score_Conversion',
    'GESAMT_SCORE', 'Priorität', 'Notizen',
  ];

  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = businesses.map((b) => [
    escape(b.firma),
    escape(b.adresse),
    escape(b.telefon),
    escape(b.email),
    escape(b.website),
    escape(b.website ? 'Ja' : 'Nein'),
    escape(b.googleBewertung),
    escape(b.anzahlBewertungen),
    escape(b.rawScores?.modernität ?? ''),
    escape(b.rawScores?.mobile ?? ''),
    escape(b.rawScores?.performance ?? ''),
    escape(b.rawScores?.technik ?? ''),
    escape(b.rawScores?.conversion ?? ''),
    escape(b.gesamtScore ?? ''),
    escape(b.priorität),
    escape(b.notizen ?? ''),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
