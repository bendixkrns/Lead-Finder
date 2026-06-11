const APIFY_BASE = 'https://api.apify.com/v2';
const ACTOR = 'compass~crawler-google-places';

export async function searchBusinessesApify(branche, region) {
  const token = process.env.APIFY_TOKEN;

  const runRes = await fetch(`${APIFY_BASE}/acts/${ACTOR}/runs`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      searchStringsArray: [`${branche} ${region}`],
      maxCrawledPlaces: 20,
      language: 'de',
      countryCode: 'de',
      maxImages: 0,
      exportPlaceUrls: false,
    }),
  });

  if (!runRes.ok) {
    const err = await runRes.json().catch(() => ({}));
    throw new Error(`Apify Start fehlgeschlagen: ${err.error?.message ?? runRes.status}`);
  }

  const { data: run } = await runRes.json();
  const datasetId = await waitForRun(run.id, token, 120);

  const itemsRes = await fetch(`${APIFY_BASE}/datasets/${datasetId}/items?format=json`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!itemsRes.ok) throw new Error(`Apify Dataset abruf fehlgeschlagen: ${itemsRes.status}`);

  const items = await itemsRes.json();
  return items.map(normalizePlace).filter(Boolean);
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

  throw new Error('Apify Run Timeout nach 120 Sekunden');
}

function normalizePlace(p) {
  if (!p?.title) return null;
  return {
    id: p.placeId ?? p.url ?? String(Math.random()),
    firma: p.title,
    branche: p.categoryName ?? null,
    adresse: p.address ?? null,
    telefon: p.phone ?? null,
    email: p.email ?? null,
    website: p.website ?? null,
    googleBewertung: p.totalScore ?? null,
    anzahlBewertungen: p.reviewsCount ?? 0,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
