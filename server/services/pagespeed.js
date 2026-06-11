const BASE = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const CATS = 'category=performance&category=accessibility&category=best-practices&category=seo';

// In-memory domain cache — survives for the lifetime of the server process
const domainCache = new Map();

export async function enrichWithPageSpeed(businesses) {
  const withSite = businesses.filter((b) => b.website);
  const noSite   = businesses.filter((b) => !b.website);

  const enriched = [];
  for (let i = 0; i < withSite.length; i += 3) {
    const batch   = withSite.slice(i, i + 3);
    const results = await Promise.all(batch.map(enrichSingle));
    enriched.push(...results);
    if (i + 3 < withSite.length) await sleep(800);
  }

  return [
    ...enriched,
    ...noSite.map((b) => ({ ...b, rawScores: null })),
  ];
}

async function enrichSingle(business) {
  const url = normalizeUrl(business.website);
  if (!url) return { ...business, rawScores: null };

  const domain = getDomain(url);

  if (domainCache.has(domain)) {
    return { ...business, rawScores: domainCache.get(domain) };
  }

  try {
    const [mobile, desktop] = await Promise.all([
      runPageSpeed(url, 'mobile'),
      runPageSpeed(url, 'desktop'),
    ]);
    const scores = computeScores(mobile, desktop, url);
    domainCache.set(domain, scores);
    return { ...business, rawScores: scores };
  } catch (err) {
    if (err.message?.includes('429')) {
      console.warn(`PageSpeed: Tageslimit erreicht (429) — Scores werden morgen verfügbar sein.`);
    }
    return { ...business, rawScores: null };
  }
}

async function runPageSpeed(url, strategy) {
  const key      = process.env.GOOGLE_API_KEY ? `&key=${process.env.GOOGLE_API_KEY}` : '';
  const endpoint = `${BASE}?url=${encodeURIComponent(url)}&strategy=${strategy}&${CATS}${key}`;
  const res      = await fetch(endpoint, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${body.slice(0, 120)}`);
  }
  return res.json();
}

function computeScores(mobile, desktop, url) {
  const score = (data, cat) =>
    Math.round((data?.lighthouseResult?.categories?.[cat]?.score ?? 0.25) * 10);

  const https       = url?.startsWith('https://') ? 10 : 2;
  const accessibility = score(mobile, 'accessibility');

  return {
    modernität:  score(mobile, 'best-practices'),
    mobile:      score(mobile, 'performance'),
    performance: score(desktop, 'performance'),
    technik:     Math.round(accessibility * 0.65 + https * 0.35),
    conversion:  score(mobile, 'seo'),
  };
}

function normalizeUrl(raw) {
  if (!raw) return null;
  const s = raw.trim();
  if (!s) return null;
  // Add https:// if no protocol present
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('//')) return `https:${s}`;
  // Skip obviously malformed values like "mailto:..." or bare IPs without dots
  if (s.startsWith('mailto:') || s.startsWith('tel:')) return null;
  return `https://${s}`;
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
