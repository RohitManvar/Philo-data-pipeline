from fastapi import FastAPI
import psycopg2

app = FastAPI()

@app.get("/philosophers")
def get_philosophers():
    conn = psycopg2.connect("dbname=philo_dw user=postgres password=password")
    cur = conn.cursor()
    cur.execute("SELECT * FROM dim_philosophers")
    return cur.fetchall()
