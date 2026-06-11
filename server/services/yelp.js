const BASE = 'https://api.yelp.com/v3/businesses/search';

export async function searchBusinessesYelp(branche, region, radiusKm) {
  const key = process.env.YELP_API_KEY;
  if (!key) return [];

  const params = new URLSearchParams({
    location: region,
    limit: '50',
    radius: String(Math.min(radiusKm * 1000, 40000)), // Yelp max: 40 km
  });
  if (branche?.trim()) params.set('term', branche.trim());

  const res = await fetch(`${BASE}?${params}`, {
    headers: { Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Yelp HTTP ${res.status}: ${body.slice(0, 120)}`);
  }

  const data = await res.json();
  return (data.businesses ?? []).map(normalizeYelp).filter(Boolean);
}

function normalizeYelp(b) {
  if (!b?.name) return null;

  const adresse = [
    ...(b.location?.display_address ?? []),
  ].join(', ') || null;

  const branche = b.categories?.[0]?.title ?? null;

  return {
    id:                `yelp-${b.id}`,
    firma:             b.name,
    branche,
    adresse,
    telefon:           b.phone || null,
    email:             null,
    website:           null, // Yelp search endpoint doesn't expose business website
    googleBewertung:   b.rating ?? null,
    anzahlBewertungen: b.review_count ?? 0,
    source:            'Yelp',
  };
}
