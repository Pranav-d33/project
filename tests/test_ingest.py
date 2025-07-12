import os
import tempfile
import pandas as pd
import pytest
from app.utils.file_loader import ingest_forecast_csv
from app.models.forecast_row import ForecastRow

# Helper: write a small CSV and return its path
def write_csv(df: pd.DataFrame) -> str:
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".csv")
    df.to_csv(tmp.name, index=False)
    return tmp.name

def test_ingest_valid_and_invalid_rows(tmp_path):
    # Construct a DataFrame with:
    # - One fully valid row
    # - One row with negative predicted_demand (invalid)
    data = [
        {
            "sku_id": "SKU1", "store_id": "S1",
            "forecast_date": "2025-07-20", "generated_at": "2025-07-18",
            "predicted_demand": 100, "hist_sales_1w": 90, "hist_sales_4w_avg": 95,
            "conf_interval_lower": 80, "conf_interval_upper": 120,
            "weather_type": "rain", "weather_severity": 2,
            "holiday_flag": 0, "event_type": "None", "promotion_flag": 1,
            "social_sentiment_score": 0.5, "anomaly_flag": 0, "supply_constraint_flag": 0
        },
        {
            # Invalid: negative demand
            "sku_id": "SKU2", "store_id": "S2",
            "forecast_date": "2025-07-20", "generated_at": "2025-07-18",
            "predicted_demand": -10, "hist_sales_1w": 50, "hist_sales_4w_avg": 55,
            "conf_interval_lower": 40, "conf_interval_upper": 60,
            "weather_type": "sunny", "weather_severity": 0,
            "holiday_flag": 0, "event_type": "None", "promotion_flag": 0,
            "social_sentiment_score": 0.1, "anomaly_flag": 0, "supply_constraint_flag": 0
        }
    ]
    df = pd.DataFrame(data)
    csv_path = write_csv(df)

    valid, invalid = ingest_forecast_csv(csv_path)

    # Expect one valid and one invalid row
    assert len(valid) == 1
    assert isinstance(valid[0], ForecastRow)
    assert len(invalid) == 1
    assert invalid[0]["row_index"] == 1
    assert any(err["loc"] == ("predicted_demand",) for err in invalid[0]["errors"])
