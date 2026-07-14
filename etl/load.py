import psycopg2
import psycopg2.extras
import os
import time


def _check_host(host: str) -> None:
    """Sanity-check DB_HOST without echoing the secret itself."""
    if "://" in host:
        print("[LOAD] WARNING: DB_HOST looks like a full URL. It must be "
              "only the hostname (no postgres://, user, or port).")
    elif "." not in host:
        print("[LOAD] WARNING: DB_HOST has no domain part, so it looks like "
              "a Render INTERNAL hostname (dpg-xxx-a). GitHub Actions needs "
              "the EXTERNAL hostname: dpg-xxx-a.<region>-postgres.render.com")
    elif not host.endswith(".render.com"):
        print("[LOAD] NOTE: DB_HOST does not end with .render.com")
    import socket
    try:
        addr = socket.getaddrinfo(host, None)[0][4][0]
        print(f"[LOAD] DB_HOST resolves to {addr}")
    except OSError as e:
        print(f"[LOAD] DB_HOST does not resolve ({e}). Check the hostname in "
              f"the GitHub secret (length={len(host)}, dots={host.count('.')}).")


def get_connection():
    base = dict(
        host=os.getenv("DB_HOST", "localhost").strip(),
        port=int(os.getenv("DB_PORT", "5434").strip()),
        dbname=os.getenv("DB_NAME", "philo_db").strip(),
        user=os.getenv("DB_USER", "postgres").strip(),
        password=os.getenv("DB_PASSWORD", "password").strip(),
        connect_timeout=15,
    )

    if base["host"] in ("localhost", "127.0.0.1"):
        return psycopg2.connect(sslmode="prefer", **base)

    _check_host(base["host"])

    # Render's SNI proxy drops TLS 1.3 ClientHellos that exceed one TCP
    # segment (OpenSSL 3.5+ post-quantum key exchange), so fall back to
    # TLS 1.2, whose ClientHello is always small.
    strategies = [
        {"sslmode": "require", "gssencmode": "disable"},
        {"sslmode": "require", "gssencmode": "disable",
         "ssl_max_protocol_version": "TLSv1.2"},
    ]
    last_err = None
    for attempt in range(1, 4):
        for params in strategies:
            desc = ", ".join(f"{k}={v}" for k, v in params.items())
            print(f"[LOAD] Connecting (attempt {attempt}: {desc})")
            try:
                return psycopg2.connect(**base, **params)
            except psycopg2.OperationalError as e:
                last_err = e
                print(f"[LOAD] Connection failed: {e}")
        time.sleep(5 * attempt)
    raise last_err


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
