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

if (!process.env.GOOGLE_API_KEY) {
  console.warn('⚠  GOOGLE_API_KEY not set – /api/search will return an error');
}

app.use('/api', searchRouter);

app.listen(PORT, () => {
  console.log(`LeadFinder API on http://localhost:${PORT}`);
});
