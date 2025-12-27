select
    name,
    intro,
    wikipedia_url,
    scraped_at
from {{ source('raw', 'stg_philosophers') }}
