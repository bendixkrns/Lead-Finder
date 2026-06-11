import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import searchRouter from './routes/search.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://bendixkrns.github.io',
  ],
}));
app.use(express.json());

const hasApify = !!process.env.APIFY_TOKEN;
const hasGoogle = !!process.env.GOOGLE_API_KEY;
if (!hasApify && !hasGoogle) {
  console.warn('⚠  Weder APIFY_TOKEN noch GOOGLE_API_KEY gesetzt – /api/search gibt Fehler zurück');
} else {
  console.log(`✓ Datenquelle: ${hasApify ? 'Apify' : 'Google Places API'}`);
}

app.use('/api', searchRouter);

app.listen(PORT, () => {
  console.log(`LeadFinder API on http://localhost:${PORT}`);
});
