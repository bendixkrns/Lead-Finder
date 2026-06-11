const NOMINATIM = 'https://nominatim.openstreetmap.org';

export async function geocodeRegion(region) {
  const url = `${NOMINATIM}/search?q=${encodeURIComponent(region)}&format=json&limit=1&accept-language=de&countrycodes=de`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'LeadFinder/1.0 (personal tool)' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return null;
  const results = await res.json();
  if (!results.length) return null;
  return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
}
