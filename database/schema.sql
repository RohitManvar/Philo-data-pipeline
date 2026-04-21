CREATE TABLE IF NOT EXISTS philosophers (
    id               SERIAL PRIMARY KEY,
    philosopher_name TEXT        NOT NULL,
    slug             TEXT        NOT NULL UNIQUE,
    intro            TEXT        NOT NULL,
    birth            TEXT,
    death            TEXT,
    era              TEXT,
    school           TEXT,
    main_ideas       TEXT,
    influenced       TEXT,
    influenced_by    TEXT,
    image_url        TEXT,
    wikipedia_url    TEXT,
    scraped_at       TIMESTAMP,
    created_at       TIMESTAMP   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_philosophers_era    ON philosophers (era);
CREATE INDEX IF NOT EXISTS idx_philosophers_school ON philosophers (school);
CREATE INDEX IF NOT EXISTS idx_philosophers_slug   ON philosophers (slug);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_philosophers_fts ON philosophers
    USING GIN (to_tsvector('english', philosopher_name || ' ' || COALESCE(intro, '') || ' ' || COALESCE(main_ideas, '')));
