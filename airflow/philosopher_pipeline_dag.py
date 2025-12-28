from airflow import DAG
from airflow.operators.bash import BashOperator
from datetime import datetime

with DAG(
    "philo_pipeline",
    start_date=datetime(2025, 1, 1),
    schedule_interval="@daily",
    catchup=False
) as dag:

    scrape = BashOperator(
        task_id="scrape_wikipedia",
        bash_command="python ingestion/wiki_scraper.py"
    )

    spark_job = BashOperator(
        task_id="spark_transform",
        bash_command="spark-submit spark_jobs/clean_philosophers.py"
    )

    dbt_run = BashOperator(
        task_id="dbt_run",
        bash_command="cd philo_dbt && dbt run && dbt test"
    )

    scrape >> spark_job >> dbt_run
