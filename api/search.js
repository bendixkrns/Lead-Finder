import { searchBusinessesApify } from '../server/services/apify.js';
import { enrichWithPageSpeed } from '../server/services/pagespeed.js';
import { deduplicateBusinesses } from '../server/services/deduplicator.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { branche, region, radius = 25, limit = 50 } = req.body;
  if (!region?.trim()) {
    return res.status(400).json({ error: 'Region ist erforderlich.' });
  }

  if (!process.env.APIFY_TOKEN) {
    return res.status(503).json({ error: 'Kein APIFY_TOKEN konfiguriert.' });
  }

  const cap = Math.min(Number(limit) || 50, 200);

  try {
    const tag = branche?.trim() ?? '';
    const reg = region.trim();
    const rad = Number(radius);

    const results = await searchBusinessesApify(tag, reg, rad)
      .then(r => r.map(b => ({ ...b, source: 'Apify' })))
      .catch(err => { console.error('Apify:', err.message); return []; });

    const deduplicated = deduplicateBusinesses(results).slice(0, cap);
    const enriched     = await enrichWithPageSpeed(deduplicated);

    return res.json({
      businesses:        enriched,
      total:             enriched.length,
      sources:           results.length ? ['Apify'] : [],
      duplicatesRemoved: results.length - deduplicated.length,
    });
  } catch (err) {
    console.error('Search error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
