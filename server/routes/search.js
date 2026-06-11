import { Router } from 'express';
import { searchBusinessesApify } from '../services/apify.js';
import { enrichWithPageSpeed } from '../services/pagespeed.js';
import { deduplicateBusinesses } from '../services/deduplicator.js';

const router = Router();

router.post('/search', async (req, res) => {
  const { branche, region, radius = 25, limit = 50 } = req.body;

  if (!region?.trim()) {
    return res.status(400).json({ error: 'Region ist erforderlich.' });
  }

  if (!process.env.APIFY_TOKEN) {
    return res.status(503).json({ error: 'Kein APIFY_TOKEN in .env gesetzt.' });
  }

  const cap = Math.min(Number(limit) || 50, 200);

  try {
    const tag = branche?.trim() ?? '';
    const reg = region.trim();
    const rad = Number(radius);

    const results = await searchBusinessesApify(tag, reg, rad)
      .then(r => r.map(b => ({ ...b, source: 'Apify' })))
      .catch(err => { console.error('Apify:', err.message); return []; });

    console.log(`→ Apify: ${results.length} Ergebnisse für "${tag || '(alle)'}" in ${reg} (${rad}km)`);

    const deduplicated = deduplicateBusinesses(results).slice(0, cap);
    const enriched     = await enrichWithPageSpeed(deduplicated);

    res.json({
      businesses:        enriched,
      total:             enriched.length,
      sources:           results.length ? ['Apify'] : [],
      duplicatesRemoved: results.length - deduplicated.length,
    });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
