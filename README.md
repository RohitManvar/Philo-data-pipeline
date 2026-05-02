# Enlyghten — Encyclopedia of Thought

A full-stack philosophy encyclopedia with a daily newspaper aesthetic. Extracts philosopher data via an ETL pipeline, stores it in PostgreSQL, serves it through a FastAPI backend, and presents it through a Next.js frontend with Google OAuth authentication.

**Live:** [enlyghten.vercel.app](https://enlyghten.vercel.app)

## Architecture

```
raw_data/  →  etl/  →  PostgreSQL  →  FastAPI (Render)  →  Next.js (Vercel)
```

| Layer     | Tech                                      | Hosting        |
|-----------|-------------------------------------------|----------------|
| ETL       | Python (extract / transform / load)       | GitHub Actions |
| Database  | PostgreSQL 16                             | Render         |
| API       | FastAPI + Uvicorn                         | Render         |
| Frontend  | Next.js 14, TypeScript, custom CSS        | Vercel         |
| Auth      | NextAuth.js + Google OAuth                | —              |

## Project Structure

```
philo-data-pipeline/
├── api/                        # FastAPI backend
│   ├── main.py                 # App entry point, CORS config, startup migration
│   ├── models.py               # SQLAlchemy models (Philosopher, SavedPhilosopher)
│   ├── schemas.py              # Pydantic schemas
│   ├── database.py             # DB session setup
│   ├── routers/
│   │   ├── philosophers.py     # List, search, filter, random, daily endpoints
│   │   ├── saved.py            # Reading list (GET / POST / PATCH / DELETE)
│   │   └── categories.py      # Eras and schools
│   ├── requirements.txt
│   └── Dockerfile
├── etl/                        # ETL pipeline
│   ├── extract.py
│   ├── transform.py
│   ├── load.py
│   └── pipeline.py
├── frontend/                   # Next.js app
│   ├── pages/
│   │   ├── index.tsx           # Home: grid, Philosopher of the Day, Surprise Me, epigraph
│   │   ├── [slug].tsx          # Philosopher detail: progress bar, share, quote card, notes
│   │   ├── archive.tsx         # Reading list (auth-protected), skeleton loader, empty state
│   │   ├── profile.tsx         # User profile, reading stats, streak, Discover Next
│   │   ├── signin.tsx          # Google sign-in
│   │   ├── about.tsx           # About page
│   │   ├── privacy.tsx         # Privacy policy
│   │   ├── terms.tsx           # Terms of use
│   │   ├── 404.tsx             # Custom not-found page
│   │   └── api/                # Next.js API routes (CORS proxy to Render)
│   │       ├── auth/[...nextauth].ts
│   │       ├── suggest.ts      # Search autocomplete proxy
│   │       └── saved/          # Reading list proxy (GET / POST / PATCH / DELETE)
│   ├── components/
│   │   ├── Navbar.tsx          # Masthead, era filters, search, user dropdown, quote intro
│   │   ├── Footer.tsx          # Links, back-to-top, last updated
│   │   ├── PhilosopherCard.tsx
│   │   └── FilterSidebar.tsx   # Stats (clickable: thinkers / eras / schools), era & school filters
│   ├── lib/
│   │   ├── api.ts              # Fetch helpers for Render API
│   │   ├── theme.ts            # Dark / light mode (localStorage)
│   │   ├── clean.ts            # Text sanitisation helpers
│   │   └── readingList.ts      # Reading list type definitions
│   ├── styles/
│   │   └── globals.css
│   └── next.config.js          # Image domains, WebP, compression
├── .github/workflows/          # GitHub Actions — ETL runs every 2 days
├── raw_data/                   # Source JSON data
└── docker-compose.yml          # Local dev: PostgreSQL + FastAPI
```

## Features

**Reading**
- **Newspaper design** — masthead, era section tabs, broadsheet grid layout
- **Philosopher of the Day** — deterministic daily pick based on date
- **Daily epigraph** — quote from today's philosopher shown on home page
- **Surprise Me** — random philosopher button
- **Reading progress bar** — scroll percentage on detail pages
- **Custom 404** — "Lost in Thought" not-found page

**Discovery**
- **Search with autocomplete** — debounced suggestions, AbortController for stale requests
- **Clickable stats sidebar** — click Thinkers / Eras / Schools to expand full lists
- **Filter by era and school** — via sidebar or section tabs

**User**
- **Google OAuth** — sign in with Google via NextAuth.js
- **Reading list** — save philosophers, stored in DB per user
- **Personal notes** — add a one-line note to any saved philosopher
- **Profile page** — reading stats, top era, reading streak, Discover Next recommendation
- **Archive page** — full reading list with skeleton loader and empty state

**UI**
- **Dark mode** — toggled from profile, persisted via localStorage
- **Quote intro** — rohyt's quote fades in on first visit (sessionStorage guard)
- **Share button** — Web Share API with clipboard fallback
- **Quote card** — shareable modal with copy + Twitter/X share
- **Footer** — About, Privacy Policy, Terms of Use, Last Updated, Back to Top
- **Responsive** — mobile-friendly layout

**Performance**
- `useMemo` for string parsing on detail pages
- Server-side sort in `getServerSideProps` (archive)
- AbortController cancels stale search requests
- WebP image format via `next.config.js`
- Gzip/Brotli compression enabled

## API Endpoints

| Method | Endpoint                              | Description                        |
|--------|---------------------------------------|------------------------------------|
| GET    | `/philosophers`                       | List all philosophers (paginated)  |
| GET    | `/philosophers/{slug}`                | Get philosopher by slug            |
| GET    | `/philosophers/search?q=`             | Full-text search                   |
| GET    | `/philosophers/filter?era=`           | Filter by era / school             |
| GET    | `/philosophers/random`                | Random philosopher                 |
| GET    | `/philosophers/daily`                 | Philosopher of the Day             |
| GET    | `/saved/{email}`                      | Get user's saved list (with notes) |
| POST   | `/saved`                              | Save a philosopher                 |
| PATCH  | `/saved/{email}/{slug}/note`          | Update personal note               |
| DELETE | `/saved/{email}/{slug}`               | Remove from saved list             |

## Getting Started (Local)

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- Python 3.10+

### 1. Start the database and API

```bash
docker-compose up --build
```

Starts PostgreSQL on port `5434` and FastAPI on port `8000`.
API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Run the ETL pipeline

```bash
cd etl
pip install -r ../requirements.txt
python pipeline.py
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

### `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Render (API)

```env
DATABASE_URL=postgresql://user:pass@host/dbname
```

## ETL Schedule

The ETL pipeline runs automatically every 2 days via GitHub Actions, fetching fresh philosopher data and loading it into the production database on Render.

## DB Migrations

Column additions run automatically on API startup via the lifespan handler in `main.py`. No manual migration step needed on deploy.

## License

MIT
