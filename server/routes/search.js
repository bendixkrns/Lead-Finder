import { Router } from 'express';
import { searchBusinesses } from '../services/places.js';
import { searchBusinessesApify } from '../services/apify.js';
import { enrichWithPageSpeed } from '../services/pagespeed.js';

const router = Router();

router.post('/search', async (req, res) => {
  const { branche, region, radius = 25 } = req.body;

  if (!branche?.trim() || !region?.trim()) {
    return res.status(400).json({ error: 'Branche und Region sind erforderlich.' });
  }

  const hasApify = !!process.env.APIFY_TOKEN;
  const hasGoogle = !!process.env.GOOGLE_API_KEY;

  if (!hasApify && !hasGoogle) {
    return res.status(503).json({
      error: 'Kein API-Key konfiguriert. Bitte APIFY_TOKEN oder GOOGLE_API_KEY in der .env Datei setzen.',
    });
  }

  try {
    const businesses = hasApify
      ? await searchBusinessesApify(branche.trim(), region.trim())
      : await searchBusinesses(branche.trim(), region.trim(), Number(radius));

    const enriched = await enrichWithPageSpeed(businesses);
    res.json({ businesses: enriched, total: enriched.length, source: hasApify ? 'apify' : 'google' });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
