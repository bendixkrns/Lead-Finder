import { searchBusinessesApify } from '../server/services/apify.js';
import { searchBusinessesOSM } from '../server/services/overpass.js';
import { enrichWithPageSpeed } from '../server/services/pagespeed.js';
import { deduplicateBusinesses } from '../server/services/deduplicator.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { branche, region, radius = 25 } = req.body;
  if (!region?.trim()) {
    return res.status(400).json({ error: 'Region ist erforderlich.' });
  }

  const hasApify = !!process.env.APIFY_TOKEN;

  try {
    const tag = branche.trim();
    const reg = region.trim();
    const rad = Number(radius);

    const [primaryResults, osmResults] = await Promise.all([
      hasApify
        ? searchBusinessesApify(tag, reg)
            .then(r => r.map(b => ({ ...b, source: 'Apify' })))
            .catch(err => { console.error('Apify:', err.message); return []; })
        : Promise.resolve([]),

      searchBusinessesOSM(tag, reg, rad)
        .catch(err => { console.error('OSM:', err.message); return []; }),
    ]);

    const combined = [...primaryResults, ...osmResults];

    if (combined.length === 0) {
      return res.status(404).json({
        error: 'Keine Ergebnisse gefunden. Versuche eine andere Branche oder Region.',
      });
    }

    const deduplicated = deduplicateBusinesses(combined);
    const enriched     = await enrichWithPageSpeed(deduplicated);

    const activeSources = [
      hasApify && primaryResults.length ? 'Apify' : null,
      osmResults.length ? 'OSM' : null,
    ].filter(Boolean);

    return res.json({
      businesses:        enriched,
      total:             enriched.length,
      sources:           activeSources,
      duplicatesRemoved: combined.length - deduplicated.length,
    });
  } catch (err) {
    console.error('Search error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
