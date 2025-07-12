import io
import csv
import pytest
import os, sys
# ensure project root is on the import path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from fastapi.testclient import TestClient
# if your FastAPI app is defined in app/main.py:
from app.main import app
# otherwise, if it lives in main.py at repo root, use:
# from main import app

client = TestClient(app)

def make_csv_bytes(rows, headers):
    """Helper to create an in-memory CSV file."""
    stream = io.StringIO()
    writer = csv.DictWriter(stream, fieldnames=headers)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    return stream.getvalue().encode('utf-8')

@pytest.fixture
def sample_csv_bytes():
    headers = [
        "sku_id","store_id","forecast_date","generated_at","predicted_demand",
        "hist_sales_1w","hist_sales_4w_avg","conf_interval_lower","conf_interval_upper",
        "weather_type","weather_severity","holiday_flag","event_type",
        "promotion_flag","social_sentiment_score","anomaly_flag","supply_constraint_flag"
    ]
    rows = [
        {
            "sku_id":"SKU100","store_id":"ST01",
            "forecast_date":"2025-07-20","generated_at":"2025-07-18",
            "predicted_demand":"50","hist_sales_1w":"45","hist_sales_4w_avg":"47",
            "conf_interval_lower":"40","conf_interval_upper":"60",
            "weather_type":"none","weather_severity":"0","holiday_flag":"0",
            "event_type":"None","promotion_flag":"0","social_sentiment_score":"0.0",
            "anomaly_flag":"0","supply_constraint_flag":"0"
        }
    ]
    return make_csv_bytes(rows, headers)

def test_ingest_endpoint(sample_csv_bytes):
    response = client.post(
        "/api/ingest/csv",
        files={"file": ("sample.csv", sample_csv_bytes, "text/csv")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["valid_row_count"] == 1
    assert data["invalid_row_count"] == 0

def test_explain_single_endpoint(sample_csv_bytes):
    # First ingest to get valid row
    ingest_res = client.post(
        "/api/ingest/csv",
        files={"file": ("sample.csv", sample_csv_bytes, "text/csv")}
    )
    assert ingest_res.status_code == 200
    valid_count = ingest_res.json()["valid_row_count"]
    assert valid_count == 1

    # Prepare the same row as JSON payload for explain
    row = ingest_res.json().get("sample_errors") or []
    # Instead, we reconstruct the payload:
    forecast_payload = {
        "sku_id":"SKU100","store_id":"ST01",
        "forecast_date":"2025-07-20","generated_at":"2025-07-18",
        "predicted_demand":50,"hist_sales_1w":45,"hist_sales_4w_avg":47,
        "conf_interval_lower":40,"conf_interval_upper":60,
        "weather_type":"none","weather_severity":0,"holiday_flag":False,
        "event_type":"None","promotion_flag":False,
        "social_sentiment_score":0.0,"anomaly_flag":False,"supply_constraint_flag":False
    }

    explain_res = client.post(
        "/api/explain/single",
        json=forecast_payload
    )
    assert explain_res.status_code == 200
    expl = explain_res.json()
    # Ensure key fields exist
    assert "narrative_explanation" in expl
    assert "top_influencer" in expl
    assert "structured_explanation" in expl
    assert "confidence_score" in expl
    assert isinstance(expl["confidence_score"], float)

