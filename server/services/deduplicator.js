export function deduplicateBusinesses(businesses) {
  const byPhone   = new Map();
  const byWebsite = new Map();
  const byName    = new Map();
  const result    = [];

  for (const b of businesses) {
    const existing = findMatch(b, byPhone, byWebsite, byName);

    if (existing) {
      merge(existing, b);
    } else {
      const entry = { ...b, sources: [b.source].filter(Boolean) };
      result.push(entry);
      index(entry, byPhone, byWebsite, byName);
    }
  }

  return result;
}

function findMatch(b, byPhone, byWebsite, byName) {
  if (b.telefon) {
    const k = normalizePhone(b.telefon);
    if (k && byPhone.has(k)) return byPhone.get(k);
  }
  if (b.website) {
    const k = normalizeWebsite(b.website);
    if (k && byWebsite.has(k)) return byWebsite.get(k);
  }
  const k = normalizeName(b.firma);
  if (k && byName.has(k)) return byName.get(k);
  return null;
}

function index(b, byPhone, byWebsite, byName) {
  if (b.telefon) {
    const k = normalizePhone(b.telefon);
    if (k) byPhone.set(k, b);
  }
  if (b.website) {
    const k = normalizeWebsite(b.website);
    if (k) byWebsite.set(k, b);
  }
  const k = normalizeName(b.firma);
  if (k) byName.set(k, b);
}

function merge(target, source) {
  if (!target.telefon  && source.telefon)  target.telefon  = source.telefon;
  if (!target.email    && source.email)    target.email    = source.email;
  if (!target.website  && source.website)  target.website  = source.website;
  if (!target.adresse  && source.adresse)  target.adresse  = source.adresse;
  if (!target.googleBewertung && source.googleBewertung) {
    target.googleBewertung   = source.googleBewertung;
    target.anzahlBewertungen = source.anzahlBewertungen;
  }
  const src = source.source;
  if (src && !target.sources.includes(src)) target.sources.push(src);
}

const normalizePhone   = (p) => p?.replace(/\D/g, '').slice(-10) || null;
const normalizeWebsite = (w) => w?.toLowerCase().replace(/https?:\/\/(www\.)?/, '').replace(/\/$/, '') || null;
const normalizeName    = (n) => n?.toLowerCase().replace(/[^a-zäöüß0-9]/g, '').slice(0, 20) || null;
