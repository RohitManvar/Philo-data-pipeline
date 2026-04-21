import psycopg2
import psycopg2.extras
import os


def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", 5434),
        dbname=os.getenv("DB_NAME", "philo_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "password"),
    )


UPSERT_SQL = """
INSERT INTO philosophers (
    philosopher_name, slug, intro, birth, death,
    era, school, main_ideas, influenced, influenced_by,
    image_url, wikipedia_url, scraped_at
) VALUES (
    %(philosopher_name)s, %(slug)s, %(intro)s, %(birth)s, %(death)s,
    %(era)s, %(school)s, %(main_ideas)s, %(influenced)s, %(influenced_by)s,
    %(image_url)s, %(wikipedia_url)s, %(scraped_at)s
)
ON CONFLICT (slug) DO UPDATE SET
    philosopher_name = EXCLUDED.philosopher_name,
    intro            = EXCLUDED.intro,
    birth            = EXCLUDED.birth,
    death            = EXCLUDED.death,
    era              = EXCLUDED.era,
    school           = EXCLUDED.school,
    main_ideas       = EXCLUDED.main_ideas,
    influenced       = EXCLUDED.influenced,
    influenced_by    = EXCLUDED.influenced_by,
    image_url        = EXCLUDED.image_url,
    wikipedia_url    = EXCLUDED.wikipedia_url,
    scraped_at       = EXCLUDED.scraped_at;
"""


CREATE_SCHEMA_SQL = """
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
CREATE INDEX IF NOT EXISTS idx_philosophers_fts ON philosophers
    USING GIN (to_tsvector('english', philosopher_name || ' ' || COALESCE(intro, '') || ' ' || COALESCE(main_ideas, '')));
"""


def run_load(records: list[dict]) -> None:
    print(f"[LOAD] Connecting to PostgreSQL...")
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(CREATE_SCHEMA_SQL)
    conn.commit()

    success = 0
    for record in records:
        try:
            cur.execute(UPSERT_SQL, record)
            success += 1
        except Exception as e:
            conn.rollback()
            print(f"  ERROR loading {record.get('philosopher_name')}: {e}")
            continue

    conn.commit()
    cur.close()
    conn.close()
    print(f"[LOAD] Loaded {success}/{len(records)} records into PostgreSQL")
