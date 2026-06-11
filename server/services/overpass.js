const NOMINATIM = 'https://nominatim.openstreetmap.org';
const OVERPASS = 'https://overpass-api.de/api/interpreter';

// German business keyword → OSM tag pairs
const TAG_MAP = {
  elektriker:    [['craft','electrician'],['shop','electrical']],
  maler:         [['craft','painter'],['craft','decorator']],
  zahnarzt:      [['amenity','dentist']],
  arzt:          [['amenity','doctors'],['amenity','clinic'],['amenity','hospital']],
  bäckerei:      [['shop','bakery']],
  friseur:       [['shop','hairdresser'],['shop','beauty']],
  schlosserei:   [['craft','locksmith'],['craft','metal_construction']],
  dachdecker:    [['craft','roofer']],
  sanitär:       [['craft','plumber']],
  klempner:      [['craft','plumber']],
  zimmermann:    [['craft','carpenter']],
  maurer:        [['craft','mason']],
  steuerberater: [['office','tax_advisor']],
  rechtsanwalt:  [['office','lawyer']],
  notar:         [['office','notary']],
  physiotherapie:[['amenity','physiotherapist']],
  optiker:       [['shop','optician']],
  apotheke:      [['amenity','pharmacy']],
  tierarzt:      [['amenity','veterinary']],
  kfz:           [['shop','car_repair'],['craft','car_repair']],
  autowerkstatt: [['shop','car_repair']],
  reinigung:     [['shop','dry_cleaning'],['shop','laundry']],
  restaurant:    [['amenity','restaurant']],
  café:          [['amenity','cafe']],
  hotel:         [['tourism','hotel'],['tourism','guest_house']],
  gartenbau:     [['craft','gardener']],
  heizung:       [['craft','hvac']],
  fahrschule:    [['amenity','driving_school']],
  küche:         [['shop','kitchen']],
  malerei:       [['craft','painter']],
};

export async function searchBusinessesOSM(branche, region, radiusKm) {
  const tags = findTags(branche.toLowerCase());
  if (!tags.length) {
    console.log(`OSM: keine Tag-Zuordnung für "${branche}" – übersprungen`);
    return [];
  }

  const location = await geocode(region);
  if (!location) {
    console.log(`OSM: Geocoding für "${region}" fehlgeschlagen`);
    return [];
  }

  const { lat, lon } = location;
  const radiusM = radiusKm * 1000;

  const conditions = tags
    .map(([k, v]) => `node["${k}"="${v}"](around:${radiusM},${lat},${lon});\nway["${k}"="${v}"](around:${radiusM},${lat},${lon});`)
    .join('\n');

  const query = `[out:json][timeout:30];\n(\n${conditions}\n);\nout body;`;

  const res = await fetch(OVERPASS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(35000),
  });

  if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);

  const data = await res.json();
  return (data.elements ?? []).map(normalizeElement).filter(Boolean);
}

async function geocode(city) {
  const url = `${NOMINATIM}/search?q=${encodeURIComponent(city)}&format=json&limit=1&accept-language=de`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'LeadFinder/1.0 (personal tool)' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return null;
  const results = await res.json();
  if (!results.length) return null;
  return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
}

function findTags(keyword) {
  if (TAG_MAP[keyword]) return TAG_MAP[keyword];
  for (const [key, tags] of Object.entries(TAG_MAP)) {
    if (keyword.includes(key) || key.includes(keyword)) return tags;
  }
  return [];
}

function normalizeElement(el) {
  const t = el.tags;
  if (!t?.name) return null;

  const street = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' ');
  const city   = [t['addr:postcode'], t['addr:city']].filter(Boolean).join(' ');
  const adresse = [street, city].filter(Boolean).join(', ') || null;

  return {
    id: `osm-${el.type}-${el.id}`,
    firma: t.name,
    branche: t.craft ?? t.amenity ?? t.shop ?? t.office ?? null,
    adresse,
    telefon: t.phone ?? t['contact:phone'] ?? null,
    email:   t.email ?? t['contact:email'] ?? null,
    website: t.website ?? t['contact:website'] ?? null,
    googleBewertung: null,
    anzahlBewertungen: 0,
    source: 'OSM',
  };
}
