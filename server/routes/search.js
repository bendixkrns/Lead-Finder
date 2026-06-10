import { Router } from 'express';
import { searchBusinesses } from '../services/places.js';
import { enrichWithPageSpeed } from '../services/pagespeed.js';

const router = Router();

router.post('/search', async (req, res) => {
  const { branche, region, radius = 25 } = req.body;

  if (!branche?.trim() || !region?.trim()) {
    return res.status(400).json({ error: 'Branche und Region sind erforderlich.' });
  }
  if (!process.env.GOOGLE_API_KEY) {
    return res.status(503).json({ error: 'GOOGLE_API_KEY nicht konfiguriert. Bitte .env Datei prüfen.' });
  }

  try {
    const businesses = await searchBusinesses(branche.trim(), region.trim(), Number(radius));
    const enriched = await enrichWithPageSpeed(businesses);
    res.json({ businesses: enriched, total: enriched.length });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
