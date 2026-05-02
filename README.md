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
│   ├── main.py                 # App entry point + CORS config
│   ├── models.py               # SQLAlchemy models (Philosopher, SavedPhilosopher)
│   ├── schemas.py              # Pydantic schemas
│   ├── database.py             # DB session setup
│   ├── routers/
│   │   ├── philosophers.py     # List, search, filter, random, daily endpoints
│   │   ├── saved.py            # Reading list (GET / POST / DELETE per user)
│   │   └── categories.py
│   ├── requirements.txt
│   └── Dockerfile
├── etl/                        # ETL pipeline
│   ├── extract.py
│   ├── transform.py
│   ├── load.py
│   └── pipeline.py
├── frontend/                   # Next.js app
│   ├── pages/
│   │   ├── index.tsx           # Home: philosopher grid, Philosopher of the Day, Surprise Me
│   │   ├── [slug].tsx          # Philosopher detail page
│   │   ├── archive.tsx         # Saved reading list (auth-protected)
│   │   ├── profile.tsx         # User profile + reading stats + Discover Next
│   │   ├── signin.tsx          # Google sign-in page
│   │   ├── about.tsx           # About page
│   │   └── api/                # Next.js API routes (CORS proxy to Render)
│   │       ├── auth/[...nextauth].ts
│   │       ├── suggest.ts      # Search autocomplete proxy
│   │       └── saved/          # Reading list proxy routes
│   ├── components/
│   │   ├── Navbar.tsx          # Masthead, era filters, search, user dropdown
│   │   ├── PhilosopherCard.tsx
│   │   └── FilterSidebar.tsx
│   ├── lib/
│   │   ├── api.ts              # Fetch helpers for Render API
│   │   ├── theme.ts            # Dark / light mode (localStorage)
│   │   ├── clean.ts            # Text sanitisation helpers
│   │   └── readingList.ts      # localStorage reading list helpers
│   └── styles/
│       └── globals.css
├── .github/workflows/          # GitHub Actions — ETL runs every 2 days
├── raw_data/                   # Source JSON data
└── docker-compose.yml          # Local dev: PostgreSQL + FastAPI
```

## Features

- **Newspaper design** — masthead, era section tabs, broadsheet grid layout
- **Google OAuth** — sign in with Google, sessions via NextAuth.js
- **Reading list** — save philosophers to your personal archive (stored in DB per user)
- **Profile page** — reading stats, top era, reading streak, Discover Next recommendation
- **Search with autocomplete** — debounced suggestions as you type
- **Philosopher of the Day** — deterministic daily pick based on date
- **Surprise Me** — random philosopher button
- **Dark mode** — persisted via localStorage
- **Reading progress bar** — scroll percentage indicator on detail pages
- **Share button** — Web Share API with clipboard fallback
- **Quote card** — shareable quote modal with copy + Twitter/X share
- **Responsive** — mobile-friendly layout

## API Endpoints

| Method | Endpoint                          | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | `/philosophers`                   | List all philosophers (paginated)  |
| GET    | `/philosophers/{slug}`            | Get philosopher by slug            |
| GET    | `/philosophers/search?q=`         | Full-text search                   |
| GET    | `/philosophers/filter?era=`       | Filter by era                      |
| GET    | `/philosophers/random`            | Random philosopher                 |
| GET    | `/philosophers/daily`             | Philosopher of the Day             |
| GET    | `/saved/{email}`                  | Get user's saved list              |
| POST   | `/saved`                          | Save a philosopher                 |
| DELETE | `/saved/{slug}`                   | Remove from saved list             |

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

The ETL pipeline runs automatically every 2 days via GitHub Actions (`.github/workflows/`), fetching fresh philosopher data and loading it into the production database on Render.

## License

MIT
