const BASE = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const CATS = 'category=performance&category=accessibility&category=best-practices&category=seo';

export async function enrichWithPageSpeed(businesses) {
  const withSite = businesses.filter((b) => b.website);
  const noSite = businesses.filter((b) => !b.website);

  const enriched = [];
  for (let i = 0; i < withSite.length; i += 3) {
    const batch = withSite.slice(i, i + 3);
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
  try {
    const [mobile, desktop] = await Promise.all([
      runPageSpeed(business.website, 'mobile'),
      runPageSpeed(business.website, 'desktop'),
    ]);
    return { ...business, rawScores: computeScores(mobile, desktop, business.website) };
  } catch {
    return { ...business, rawScores: null };
  }
}

async function runPageSpeed(url, strategy) {
  const key = process.env.GOOGLE_API_KEY ? `&key=${process.env.GOOGLE_API_KEY}` : '';
  const endpoint = `${BASE}?url=${encodeURIComponent(url)}&strategy=${strategy}&${CATS}${key}`;
  const res = await fetch(endpoint, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`PageSpeed HTTP ${res.status}`);
  return res.json();
}

function computeScores(mobile, desktop, url) {
  const score = (data, cat) =>
    Math.round((data?.lighthouseResult?.categories?.[cat]?.score ?? 0.25) * 10);

  const https = url?.startsWith('https://') ? 10 : 2;
  const accessibility = score(mobile, 'accessibility');

  return {
    modernität: score(mobile, 'best-practices'),
    mobile: score(mobile, 'performance'),
    performance: score(desktop, 'performance'),
    technik: Math.round(accessibility * 0.65 + https * 0.35),
    conversion: score(mobile, 'seo'),
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
