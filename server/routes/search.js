import { Router } from 'express';
import { searchBusinesses } from '../services/places.js';
import { searchBusinessesApify } from '../services/apify.js';
import { searchBusinessesOSM } from '../services/overpass.js';
import { enrichWithPageSpeed } from '../services/pagespeed.js';
import { deduplicateBusinesses } from '../services/deduplicator.js';

const router = Router();

router.post('/search', async (req, res) => {
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

    res.json({
      businesses:        enriched,
      total:             enriched.length,
      sources:           activeSources,
      duplicatesRemoved: combined.length - deduplicated.length,
    });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
