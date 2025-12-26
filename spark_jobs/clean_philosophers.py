from pyspark.sql import SparkSession
from pyspark.sql.functions import trim, regexp_replace

spark = SparkSession.builder.appName("PhiloETL").getOrCreate()

df = spark.read.json("raw_data/philosophers/*.json")

clean_df = (
    df
    .withColumn("name", trim("name"))
    .withColumn("intro", regexp_replace("intro", r"\[\d+\]", ""))
    .dropDuplicates(["name"])
)

clean_df.write \
    .mode("overwrite") \
    .format("jdbc") \
    .option("url", "jdbc:postgresql://localhost:5432/philo_dw") \
    .option("dbtable", "stg_philosophers") \
    .option("user", "postgres") \
    .option("password", "password") \
    .save()
