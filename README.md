# Enlyghten — Encyclopedia of Thought

A full-stack philosophy data pipeline that extracts philosopher data, transforms and loads it into PostgreSQL, and serves it through a FastAPI backend and a Next.js frontend.

## Architecture

```
raw_data/  →  etl/  →  PostgreSQL  →  FastAPI  →  Next.js frontend
```

| Layer     | Tech                        |
|-----------|-----------------------------|
| ETL       | Python (extract/transform/load) |
| Database  | PostgreSQL 16               |
| API       | FastAPI + Uvicorn           |
| Frontend  | Next.js 14, TypeScript, Tailwind CSS |
| Infra     | Docker Compose              |

## Project Structure

```
philo-data-pipeline/
├── api/                  # FastAPI backend
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── routers/
│   │   ├── philosophers.py
│   │   └── categories.py
│   ├── requirements.txt
│   └── Dockerfile
├── etl/                  # ETL pipeline
│   ├── extract.py
│   ├── transform.py
│   ├── load.py
│   └── pipeline.py
├── database/
│   └── schema.sql
├── frontend/             # Next.js app
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   ├── styles/
│   └── package.json
├── raw_data/             # Source JSON data
├── docker-compose.yml
└── requirements.txt
```

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- Node.js 18+ (for frontend dev)
- Python 3.10+ (for running ETL locally)

### 1. Start the database and API

```bash
docker-compose up --build
```

This starts:
- PostgreSQL on port `5434`
- FastAPI on port `8000`

API docs available at [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Run the ETL pipeline

```bash
cd etl
pip install -r ../requirements.txt
python pipeline.py
```

This extracts, transforms, and loads philosopher data into the database.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/philosophers`           | List all philosophers    |
| GET    | `/philosophers/{slug}`    | Get philosopher by slug  |
| GET    | `/categories`             | List all categories      |

## Frontend Features

- Browse and search philosophers by name, era, or category
- Dark / light theme toggle
- Responsive design with animated UI components
- Philosopher detail pages with full bios

## Environment Variables

Create `frontend/.env.local` for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## License

MIT
