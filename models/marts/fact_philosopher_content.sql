select
    philosopher_id,
    current_date as created_date
from {{ ref('dim_philosophers') }}
