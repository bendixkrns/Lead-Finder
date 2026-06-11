# LeadFinder — Claude Context

## Projektübersicht
Business Research & Lead-Scoring Tool für Webdesigner. Sucht lokale Unternehmen mit schlechter Web-Präsenz (kein PageSpeed-Score, keine Website, kein Google-Ranking).

## Lokaler Start
```
cd "C:\Users\krone\OneDrive\Dokumente\Claude\Claude Code\Lead-Finder"
npm run dev:all
```
- Frontend: http://localhost:5173
- Backend (Express): http://localhost:3001

## Repo & Branch
- GitHub: https://github.com/bendixkrns/Lead-Finder
- Aktiver Branch: `claude/business-research-lead-tool-k7910m`

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js/Express (`server/index.js`, Port 3001)
- Serverless (Vercel): `api/search.js`
- Package-Typ: ESM (`"type": "module"` in package.json)

## API-Quellen (alle parallel)
| Quelle | Key | Kosten | Qualität |
|---|---|---|---|
| Apify (Google Maps Scraper) | `APIFY_TOKEN` in `.env` | $5 Gratisguthaben/Monat | Sehr gut |
| Google Places | `GOOGLE_API_KEY` in `.env` | $200 Gratisguthaben/Monat | Sehr gut |
| OSM/Overpass | Kein Key | Kostenlos | Mäßig |
| PageSpeed Insights | Kein Key | 25k Req/Tag kostenlos | Automatisch |

## .env (nicht committet, im Projekt-Root)
```
APIFY_TOKEN=apify_api_...
PORT=3001
# Optional: GOOGLE_API_KEY=AIzaSy...
```

## Wichtige Entscheidungen
- **Yelp wurde explizit abgelehnt** — Nutzer wollte keinen weiteren Account
- **Apify nutzt `compass~crawler-google-places`** — Actor wird automatisch gewählt, kein manuelles Konfigurieren nötig
- **Branche ist optional** — nur Region ist Pflichtfeld
- **PLZ-Autocomplete** über openplzapi.org (kein Key nötig)
- **OSM-Mirror**: maps.mail.ru als Primary, overpass-api.de als Fallback (overpass-api.de blockiert manchmal)
- **Deduplication**: phone → website → name (fuzzy)
- **Ergebnis-Limit**: konfigurierbar 10/25/50/100/200, Default 50, Max 200

## Dateistruktur (relevante Dateien)
```
api/search.js                    ← Vercel Serverless Function
server/
  index.js                       ← Express Server Entry
  routes/search.js               ← Express Route (lokal)
  services/
    apify.js                     ← Apify Google Maps Scraper
    places.js                    ← Google Places API
    overpass.js                  ← OSM/Overpass (TAG_MAP mit 60+ deutschen Keywords)
    pagespeed.js                 ← PageSpeed Insights (kein Key)
    deduplicator.js              ← Deduplizierung nach phone/website/name
src/
  App.jsx                        ← Haupt-App, searchConfig State
  components/
    SearchPanel.jsx              ← Suchmaske + RegionAutocomplete + AdvancedOptions
    ResultsList.jsx              ← Ergebnisliste mit Lead-Score
vercel.json                      ← maxDuration:30, SPA-Rewrite
```

## Bekannte Eigenheiten
- `overpass.js` TAG_MAP: Schlüssel dürfen keine Leerzeichen enthalten (führte zu `friseursal on` Syntax-Fehler in der Vergangenheit)
- Apify-Suche dauert 30–60 Sekunden (läuft auf Apify-Servern)
- `.env.example` enthielt einmal versehentlich einen echten Token — wurde inzwischen bereinigt. Token wurde rotiert.
- PowerShell auf diesem System: `npx`/`vercel` manchmal im PATH-Problem. Fix: `$env:Path = "C:\Program Files\nodejs;$env:APPDATA\npm;" + $env:Path`
