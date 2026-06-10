import * as XLSX from 'xlsx';

function buildRows(businesses) {
  return businesses.map((b) => ({
    Firma: b.firma ?? '',
    Branche: b.branche ?? '',
    Adresse: b.adresse ?? '',
    Telefon: b.telefon ?? '',
    Email: b.email ?? '',
    Website: b.website ?? '',
    Hat_Website: b.website ? 'Ja' : 'Nein',
    Google_Bewertung: b.googleBewertung ?? '',
    Anzahl_Bewertungen: b.anzahlBewertungen ?? '',
    'Score_Modernität': b.rawScores?.modernität ?? '',
    Score_Mobile: b.rawScores?.mobile ?? '',
    Score_Performance: b.rawScores?.performance ?? '',
    Score_Technik: b.rawScores?.technik ?? '',
    Score_Conversion: b.rawScores?.conversion ?? '',
    GESAMT_SCORE: b.gesamtScore ?? '',
    Priorität: b.priorität ?? '',
    Notizen: b.notizen ?? '',
  }));
}

export function exportExcel(businesses) {
  const rows = buildRows(businesses);
  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 32 }, // Firma
    { wch: 18 }, // Branche
    { wch: 38 }, // Adresse
    { wch: 20 }, // Telefon
    { wch: 30 }, // Email
    { wch: 38 }, // Website
    { wch: 13 }, // Hat_Website
    { wch: 17 }, // Google_Bewertung
    { wch: 19 }, // Anzahl_Bewertungen
    { wch: 17 }, // Score_Modernität
    { wch: 14 }, // Score_Mobile
    { wch: 17 }, // Score_Performance
    { wch: 14 }, // Score_Technik
    { wch: 17 }, // Score_Conversion
    { wch: 14 }, // GESAMT_SCORE
    { wch: 12 }, // Priorität
    { wch: 32 }, // Notizen
  ];

  ws['!freeze'] = { xSplit: 0, ySplit: 1 };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leads');
  XLSX.writeFile(wb, `leads_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportCSV(businesses) {
  const headers = Object.keys(buildRows([businesses[0]]));
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const rows = buildRows(businesses).map((r) => Object.values(r).map(escape).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
