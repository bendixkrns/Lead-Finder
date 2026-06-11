const NOMINATIM = 'https://nominatim.openstreetmap.org';

// Ordered list of Overpass mirrors — first one that responds wins
const OVERPASS_MIRRORS = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

// German business keyword → OSM tag pairs
const TAG_MAP = {
  // Elektro
  elektriker:           [['craft','electrician'],['shop','electrical']],
  elektro:              [['craft','electrician'],['shop','electrical']],
  elektroinstallateur:  [['craft','electrician']],

  // Maler / Lackierer
  maler:                [['craft','painter'],['craft','decorator']],
  malerei:              [['craft','painter']],
  lackierer:            [['craft','painter']],
  malermeister:         [['craft','painter']],

  // Sanitär / Heizung / Klempner
  sanitär:              [['craft','plumber']],
  klempner:             [['craft','plumber']],
  heizung:              [['craft','hvac'],['craft','plumber']],
  heizungsinstallateur: [['craft','hvac'],['craft','plumber']],
  sanitärinstallateur:  [['craft','plumber']],
  installateur:         [['craft','hvac'],['craft','plumber']],
  hls:                  [['craft','hvac'],['craft','plumber']],
  rohrleitungsbau:      [['craft','plumber']],

  // Dach
  dachdecker:           [['craft','roofer']],
  dach:                 [['craft','roofer']],

  // Holz / Bau
  zimmermann:           [['craft','carpenter']],
  zimmerei:             [['craft','carpenter']],
  tischler:             [['craft','carpenter'],['craft','joiner']],
  schreiner:            [['craft','carpenter'],['craft','joiner']],
  maurer:               [['craft','mason']],
  bauunternehmen:       [['craft','builder']],
  baufirma:             [['craft','builder']],
  trockenbau:           [['craft','drywall_construction']],

  // Schlosserei / Metall
  schlosserei:          [['craft','locksmith'],['craft','metal_construction']],
  schlüsseldienst:      [['craft','locksmith']],
  metallbau:            [['craft','metal_construction']],

  // Garten / Landschaft
  gartenbau:            [['craft','gardener'],['landuse','garden_centre']],
  gärtner:              [['craft','gardener']],
  landschaftsgärtner:   [['craft','gardener']],
  galabau:              [['craft','gardener']],

  // Reinigung
  reinigung:            [['shop','dry_cleaning'],['shop','laundry']],
  gebäudereinigung:     [['shop','dry_cleaning']],
  fensterreinigung:     [['shop','dry_cleaning']],

  // Fahrzeug
  kfz:                  [['shop','car_repair'],['craft','car_repair']],
  autowerkstatt:        [['shop','car_repair']],
  autohaus:             [['shop','car'],['shop','car_dealer']],
  reifenservice:        [['shop','tyres']],

  // Ärzte / Gesundheit
  zahnarzt:             [['amenity','dentist']],
  zahnarztpraxis:       [['amenity','dentist']],
  arzt:                 [['amenity','doctors'],['amenity','clinic']],
  arztpraxis:           [['amenity','doctors']],
  allgemeinarzt:        [['amenity','doctors']],
  hausarzt:             [['amenity','doctors']],
  facharzt:             [['amenity','doctors'],['amenity','clinic']],
  physiotherapie:       [['amenity','physiotherapist']],
  physiotherapeut:      [['amenity','physiotherapist']],
  krankenhaus:          [['amenity','hospital']],
  klinik:               [['amenity','clinic'],['amenity','hospital']],
  apotheke:             [['amenity','pharmacy']],
  optiker:              [['shop','optician']],
  tierarzt:             [['amenity','veterinary']],
  tierarztpraxis:       [['amenity','veterinary']],

  // Friseur / Beauty
  friseur:              [['shop','hairdresser'],['shop','beauty']],
  frisör:               [['shop','hairdresser']],
  friseursalon:         [['shop','hairdresser']],
  kosmetik:             [['shop','beauty'],['shop','cosmetics']],
  kosmetikstudio:       [['shop','beauty']],
  nagelstudio:          [['shop','nail_salon']],

  // Gastronomie
  restaurant:           [['amenity','restaurant']],
  gaststätte:           [['amenity','restaurant']],
  café:                 [['amenity','cafe']],
  cafe:                 [['amenity','cafe']],
  bäckerei:             [['shop','bakery']],
  bäcker:               [['shop','bakery']],
  konditorei:           [['shop','confectionery'],['amenity','cafe']],
  imbiss:               [['amenity','fast_food']],
  fastfood:             [['amenity','fast_food']],
  pizzeria:             [['amenity','restaurant']],

  // Unterkunft
  hotel:                [['tourism','hotel'],['tourism','guest_house']],
  pension:              [['tourism','guest_house']],
  unterkunft:           [['tourism','hotel'],['tourism','guest_house']],

  // Beratung / Büro
  steuerberater:        [['office','tax_advisor']],
  steuerbüro:           [['office','tax_advisor']],
  rechtsanwalt:         [['office','lawyer']],
  anwalt:               [['office','lawyer']],
  kanzlei:              [['office','lawyer']],
  notar:                [['office','notary']],
  unternehmensberatung: [['office','consulting']],
  beratung:             [['office','consulting']],
  versicherung:         [['office','insurance']],
  makler:               [['office','estate_agent']],
  immobilien:           [['office','estate_agent']],
  architekt:            [['office','architect']],

  // Fahrschule
  fahrschule:           [['amenity','driving_school']],

  // Küche / Einrichtung
  küche:                [['shop','kitchen']],
  möbel:                [['shop','furniture']],
  inneneinrichtung:     [['shop','furniture'],['shop','interior_decoration']],

  // IT / Druck
  druckerei:            [['shop','copyshop']],
  werbeagentur:         [['office','advertising_agency']],
  werbung:              [['office','advertising_agency']],
  webdesign:            [['office','it']],
  it:                   [['office','it']],
};

export async function searchBusinessesOSM(branche, region, radiusKm) {
  const location = await geocode(region);
  if (!location) {
    console.log(`OSM: Geocoding für "${region}" fehlgeschlagen`);
    return [];
  }

  const { lat, lon } = location;
  const radiusM = radiusKm * 1000;

  // Stufe 1: Tag-basierte Suche (spezifisch)
  const tags = branche?.trim() ? findTags(branche.trim().toLowerCase()) : [];

  let query;
  if (tags.length) {
    const conditions = tags
      .map(([k, v]) =>
        `node["${k}"="${v}"](around:${radiusM},${lat},${lon});\nway["${k}"="${v}"](around:${radiusM},${lat},${lon});`
      )
      .join('\n');
    query = `[out:json][timeout:30];\n(\n${conditions}\n);\nout body;`;
  } else {
    // Stufe 2: Allgemein-Fallback — alle Geschäfte im Umkreis
    console.log(`OSM: kein Tag-Match für "${branche || '(leer)'}" – allgemeine Suche`);
    query = `[out:json][timeout:30];
(
  node["name"]["shop"](around:${radiusM},${lat},${lon});
  node["name"]["craft"](around:${radiusM},${lat},${lon});
  node["name"]["office"](around:${radiusM},${lat},${lon});
  node["name"]["amenity"](around:${radiusM},${lat},${lon});
  way["name"]["shop"](around:${radiusM},${lat},${lon});
  way["name"]["craft"](around:${radiusM},${lat},${lon});
  way["name"]["office"](around:${radiusM},${lat},${lon});
);
out body;`;
  }

  const res = await fetchOverpass(query);

  const data = await res.json();
  const results = (data.elements ?? []).map(normalizeElement).filter(Boolean);

  // Cap fallback results to avoid flooding the UI
  return tags.length ? results : results.slice(0, 50);
}

async function fetchOverpass(query) {
  let lastErr;
  for (const url of OVERPASS_MIRRORS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(35000),
      });
      if (res.ok) return res;
      lastErr = new Error(`Overpass ${new URL(url).hostname} HTTP ${res.status}`);
    } catch (e) {
      lastErr = e;
      console.warn(`Overpass mirror ${url} fehlgeschlagen:`, e.message);
    }
  }
  throw lastErr;
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

  // Collect ALL partial matches (not just first)
  const allTags = [];
  const seen = new Set();
  for (const [key, tags] of Object.entries(TAG_MAP)) {
    if (keyword.includes(key) || key.includes(keyword)) {
      for (const tag of tags) {
        const id = tag.join('=');
        if (!seen.has(id)) { seen.add(id); allTags.push(tag); }
      }
    }
  }
  return allTags;
}

function normalizeElement(el) {
  const t = el.tags;
  if (!t?.name) return null;

  const street  = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' ');
  const city    = [t['addr:postcode'], t['addr:city']].filter(Boolean).join(' ');
  const adresse = [street, city].filter(Boolean).join(', ') || null;

  return {
    id:               `osm-${el.type}-${el.id}`,
    firma:            t.name,
    branche:          t.craft ?? t.amenity ?? t.shop ?? t.office ?? null,
    adresse,
    telefon:          t.phone ?? t['contact:phone'] ?? null,
    email:            t.email ?? t['contact:email'] ?? null,
    website:          t.website ?? t['contact:website'] ?? null,
    googleBewertung:  null,
    anzahlBewertungen: 0,
    source:           'OSM',
  };
}
