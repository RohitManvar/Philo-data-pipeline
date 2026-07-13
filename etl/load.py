import psycopg2
import psycopg2.extras
import os


def get_connection():
    host = os.getenv("DB_HOST", "localhost")
    port = int(os.getenv("DB_PORT", 5434))
    dbname = os.getenv("DB_NAME", "philo_db")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "password")
    
    if host not in ["localhost", "127.0.0.1"]:
        print(f"[DEBUG] Running pure-Python SSL diagnostic to {host}:{port}...")
        try:
            import socket, ssl, struct
            sock = socket.create_connection((host, port), timeout=5)
            sock.sendall(struct.pack("!II", 8, 80877103))
            resp = sock.recv(1)
            if resp == b'S':
                print("[DEBUG] Server said 'S' (SSL supported). Handshaking...")
                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE
                ssock = ctx.wrap_socket(sock, server_hostname=host)
                print(f"[DEBUG] Handshake SUCCESS! Cipher: {ssock.cipher()}")
                ssock.close()
            else:
                print(f"[DEBUG] Server refused SSL request: {resp}")
                sock.close()
        except Exception as e:
            print(f"[DEBUG] SSL diagnostic failed: {type(e).__name__}: {e}")
            
    sslmode = "require" if host not in ["localhost", "127.0.0.1"] else "prefer"
    
    print(f"[LOAD] psycopg2 connecting with sslmode={sslmode} and gssencmode=disable")
    return psycopg2.connect(
        host=host, port=port, dbname=dbname, user=user, password=password, 
        sslmode=sslmode, gssencmode="disable"
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
