select distinct
    'Unknown' as era_name
from {{ ref('stg_philosophers') }}
