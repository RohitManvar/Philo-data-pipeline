select
    row_number() over () as philosopher_id,
    name,
    wikipedia_url
from {{ ref('stg_philosophers') }}
