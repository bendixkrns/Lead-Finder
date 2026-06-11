import { geocodeRegion } from './geocode.js';

const BASE = 'https://maps.googleapis.com/maps/api/place';

export async function searchBusinesses(branche, region, radiusKm) {
  const key = process.env.GOOGLE_API_KEY;

  const location = await geocodeRegion(region);
  if (!location) throw new Error(`Google Places: Geocoding für "${region}" fehlgeschlagen`);

  const { lat, lon } = location;
  const radiusM = Math.min(radiusKm * 1000, 50000); // Places API max 50km

  // nearbysearch enforces radius strictly (textsearch only uses it as a hint)
  const keyword = branche?.trim() || '';
  const params  = new URLSearchParams({
    location: `${lat},${lon}`,
    radius:   radiusM,
    language: 'de',
    key,
    ...(keyword && { keyword }),
  });

  const res  = await fetch(`${BASE}/nearbysearch/json?${params}`);
  const data = await res.json();

  if (data.status === 'ZERO_RESULTS') return [];
  if (data.status !== 'OK') {
    throw new Error(`Google Places: ${data.status} – ${data.error_message ?? ''}`);
  }

  const places = (data.results ?? []).slice(0, 20);
  const businesses = [];

  for (let i = 0; i < places.length; i += 5) {
    const batch   = places.slice(i, i + 5);
    const results = await Promise.all(batch.map(p => fetchDetails(p, key)));
    businesses.push(...results.filter(Boolean));
    if (i + 5 < places.length) await sleep(300);
  }

  return businesses;
}

async function fetchDetails(place, key) {
  const fields = 'name,formatted_address,formatted_phone_number,website,rating,user_ratings_total';
  const url    = `${BASE}/details/json?place_id=${place.place_id}&fields=${fields}&language=de&key=${key}`;

  try {
    const res  = await fetch(url);
    const data = await res.json();
    if (data.status !== 'OK') return null;

    const r = data.result;
    return {
      id:                place.place_id,
      firma:             r.name,
      branche:           place.types?.[0] ?? null,
      adresse:           r.formatted_address ?? place.vicinity ?? null,
      telefon:           r.formatted_phone_number ?? null,
      email:             null,
      website:           r.website ?? null,
      googleBewertung:   r.rating ?? null,
      anzahlBewertungen: r.user_ratings_total ?? 0,
    };
  } catch {
    return null;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
