import { searchBusinessesApify } from '../server/services/apify.js';
import { searchBusinesses } from '../server/services/places.js';
import { searchBusinessesOSM } from '../server/services/overpass.js';
import { enrichWithPageSpeed } from '../server/services/pagespeed.js';
import { deduplicateBusinesses } from '../server/services/deduplicator.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { branche, region, radius = 25, limit = 50 } = req.body;
  if (!region?.trim()) {
    return res.status(400).json({ error: 'Region ist erforderlich.' });
  }

  const hasApify  = !!process.env.APIFY_TOKEN;
  const hasGoogle = !!process.env.GOOGLE_API_KEY;
  const cap       = Math.min(Number(limit) || 50, 200);

  try {
    const tag = branche?.trim() ?? '';
    const reg = region.trim();
    const rad = Number(radius);

    const [apifyResults, googleResults, osmResults] = await Promise.all([
      hasApify
        ? searchBusinessesApify(tag, reg)
            .then(r => r.map(b => ({ ...b, source: 'Apify' })))
            .catch(err => { console.error('Apify:', err.message); return []; })
        : [],

      hasGoogle
        ? searchBusinesses(tag, reg, rad)
            .then(r => r.map(b => ({ ...b, source: 'Google' })))
            .catch(err => { console.error('Google:', err.message); return []; })
        : [],

      searchBusinessesOSM(tag, reg, rad, cap)
        .catch(err => { console.error('OSM:', err.message); return []; }),
    ]);

    const combined     = [...apifyResults, ...googleResults, ...osmResults];
    const deduplicated = deduplicateBusinesses(combined);
    const enriched     = await enrichWithPageSpeed(deduplicated);

    const activeSources = [
      hasApify  && apifyResults.length  ? 'Apify'  : null,
      hasGoogle && googleResults.length ? 'Google' : null,
      osmResults.length                 ? 'OSM'    : null,
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
