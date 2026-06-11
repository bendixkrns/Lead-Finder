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
- Vercel: automatisch deployed bei Push — Tool läuft mobil erreichbar

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js/Express (`server/index.js`, Port 3001)
- Serverless (Vercel): `api/search.js`
- Package-Typ: ESM (`"type": "module"` in package.json)

## API-Quellen
| Quelle | Key | Zweck |
|---|---|---|
| Apify (`compass~crawler-google-places`) | `APIFY_TOKEN` | Einzige Geschäftsdatenquelle |
| PageSpeed Insights | `GOOGLE_API_KEY` | Website-Scoring (kein Billing nötig) |

**OSM wurde entfernt** (schlechte Qualität, Radius nicht durchsetzbar)
**Google Places wurde abgelehnt** (erfordert Billing/Zahlungsdaten)
**Yelp wurde explizit abgelehnt** (kein weiterer Account gewünscht)

## .env (nicht committet, im Projekt-Root)
```
APIFY_TOKEN=apify_api_...
GOOGLE_API_KEY=AIzaSy...
PORT=3001
```

## Wichtige Entscheidungen & Architektur
- **Apify**: Geocoding via Nominatim → lat/lng/zoom an Actor, danach Haversine-Filter für strikten Radius
- **Apify-Timeout**: 120s lokal, 55s auf Vercel (Limit: 60s)
- **PageSpeed**: Domain-Cache (kein Doppelabfragen), URL-Normalisierung, 429 wird abgefangen
- **Branche ist optional** — nur Region ist Pflichtfeld
- **PLZ-Autocomplete** über openplzapi.org (kein Key nötig)
- **Deduplication**: phone → website → name (fuzzy, GmbH/AG/KG entfernt beim Matching)
- **Ergebnis-Limit**: konfigurierbar 10/25/50/100/200, Default 50, Max 200

## Prioritätssystem
| Badge | Bedeutung | ScoreRing |
|---|---|---|
| HOCH (rot) | Keine Website | Roter Ring · N/A |
| MITTEL (orange) | Website, Score < 4 | Oranger Ring |
| NIEDRIG (grün) | Website, Score > 6 | Grüner Ring |
| N/A (grau) | Website vorhanden, nicht messbar | Grauer gestrichelter Ring · ? |

Sortierreihenfolge: HOCH → MITTEL → NIEDRIG → N/A

## Dateistruktur (relevante Dateien)
```
api/search.js                    ← Vercel Serverless Function
server/
  index.js                       ← Express Server Entry
  routes/search.js               ← Express Route (lokal)
  services/
    apify.js                     ← Apify Google Maps Scraper + Haversine-Filter
    geocode.js                   ← Nominatim Geocoding (shared utility)
    pagespeed.js                 ← PageSpeed Insights + Domain-Cache
    deduplicator.js              ← Deduplizierung nach phone/website/name
    places.js                    ← Google Places (vorhanden, aber nicht aktiv genutzt)
src/
  App.jsx                        ← Haupt-App, searchConfig + PRIORITY_ORDER
  components/
    SearchPanel.jsx              ← Suchmaske + RegionAutocomplete + AdvancedOptions
    BusinessCard.jsx             ← Karte mit ScoreRing + PriorityBadge
    ScoreRing.jsx                ← Unterscheidet: kein Score vs. nicht messbar
    FilterBar.jsx                ← Filter inkl. N/A-Priorität
  utils/
    scoring.js                   ← computeScore, getPriority, priorityColor/Bg
vercel.json                      ← maxDuration:60s, SPA-Rewrite
vite.config.js                   ← base '/' (nicht '/Lead-Finder/' — war GitHub Pages)
```

## Bekannte Eigenheiten
- Apify-Suche dauert 30–60 Sekunden
- PageSpeed-Tageslimit (429): resettet täglich um Mitternacht
- PowerShell PATH-Problem: `$env:Path = "C:\Program Files\nodejs;$env:APPDATA\npm;" + $env:Path`
- `.env.example` enthielt einmal versehentlich einen echten Token — wurde bereinigt und rotiert
