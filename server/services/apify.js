import { geocodeRegion } from './geocode.js';

const APIFY_BASE = 'https://api.apify.com/v2';
const ACTOR      = 'compass~crawler-google-places';

export async function searchBusinessesApify(branche, region, radiusKm = 25) {
  const token    = process.env.APIFY_TOKEN;
  const isVercel = !!process.env.VERCEL;

  const location = await geocodeRegion(region);
  if (!location) throw new Error(`Apify: Geocoding für "${region}" fehlgeschlagen`);

  const { lat, lon } = location;
  const zoom = radiusKm <= 10 ? 14 : radiusKm <= 25 ? 13 : radiusKm <= 50 ? 12 : 11;

  const searchString = branche?.trim()
    ? `${branche.trim()} ${region}`
    : region;

  const runRes = await fetch(`${APIFY_BASE}/acts/${ACTOR}/runs`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      searchStringsArray:      [searchString],
      lat,
      lng:                     lon,
      zoom,
      maxCrawledPlacesPerSearch: isVercel ? 15 : 40, // correct param name
      memoryMbytes:            1024,
      language:                'de',
      countryCode:             'de',
      maxImages:               0,
      exportPlaceUrls:         false,
    }),
  });

  if (!runRes.ok) {
    const err = await runRes.json().catch(() => ({}));
    throw new Error(`Apify Start fehlgeschlagen: ${err.error?.message ?? runRes.status}`);
  }

  const { data: run } = await runRes.json();
  const datasetId = await waitForRun(run.id, token, isVercel ? 45 : 120);

  const itemsRes = await fetch(`${APIFY_BASE}/datasets/${datasetId}/items?format=json`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!itemsRes.ok) throw new Error(`Apify Dataset abruf fehlgeschlagen: ${itemsRes.status}`);

  const items = await itemsRes.json();

  const results = items
    .map(normalizePlace)
    .filter(Boolean)
    .filter(b => {
      if (b._lat == null || b._lng == null) return true;
      const dist = haversineKm(lat, lon, b._lat, b._lng);
      if (dist > radiusKm) {
        console.log(`  Gefiltert (${Math.round(dist)}km > ${radiusKm}km): ${b.firma}`);
        return false;
      }
      return true;
    })
    .map(({ _lat, _lng, ...rest }) => rest);

  console.log(`  Apify: ${items.length} gescraped → ${results.length} im ${radiusKm}km Radius`);
  return results;
}

async function waitForRun(runId, token, timeoutSecs) {
  const deadline = Date.now() + timeoutSecs * 1000;

  while (Date.now() < deadline) {
    await sleep(3000);

    const res = await fetch(`${APIFY_BASE}/actor-runs/${runId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { data } = await res.json();

    if (data.status === 'SUCCEEDED') return data.defaultDatasetId;
    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(data.status)) {
      throw new Error(`Apify Run ${data.status}`);
    }
  }

  throw new Error(`Apify Run Timeout nach ${timeoutSecs} Sekunden`);
}

function normalizePlace(p) {
  if (!p?.title) return null;
  return {
    id:                p.placeId ?? p.url ?? String(Math.random()),
    firma:             p.title,
    branche:           p.categoryName ?? null,
    adresse:           p.address ?? null,
    telefon:           p.phone ?? null,
    email:             p.email ?? null,
    website:           p.website?.trim() || null,
    googleBewertung:   p.totalScore ?? null,
    anzahlBewertungen: p.reviewsCount ?? 0,
    _lat:              p.location?.lat ?? p.lat ?? null,
    _lng:              p.location?.lng ?? p.lng ?? null,
  };
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a    = Math.sin(dLat / 2) ** 2
             + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
             * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
