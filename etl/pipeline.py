from extract import run_extract
from transform import run_transform
from load import run_load


def run_pipeline(limit: int = 100):
    print("=" * 40)
    print("PHILO ETL PIPELINE STARTED")
    print("=" * 40)

    raw = run_extract(limit=limit)
    clean = run_transform(raw)
    run_load(clean)

    print("=" * 40)
    print("PIPELINE COMPLETE")
    print("=" * 40)


if __name__ == "__main__":
    run_pipeline(limit=300)
