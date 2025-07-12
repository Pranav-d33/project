from typing import List, Tuple, Dict, Any
import pandas as pd
from datetime import datetime
from pydantic import ValidationError
from app.models.forecast_row import ForecastRow

def ingest_forecast_csv(
    csv_path: str
) -> Tuple[List[ForecastRow], List[Dict[str, Any]]]:
    df = pd.read_csv(csv_path)
    
    valid_rows: List[ForecastRow] = []
    invalid_rows: List[Dict[str, Any]] = []
    
    for idx, row in df.iterrows():
        # Convert pandas row to dict
        record = row.to_dict()
        
        # Parse dates (assuming ISO format like "2024-01-15")
        for date_col in ["forecast_date", "generated_at"]:
            if date_col in record and not pd.isna(record[date_col]):
                try:
                    record[date_col] = datetime.strptime(record[date_col], "%Y-%m-%d").date()
                except (ValueError, TypeError):
                    # Let Pydantic handle the validation error
                    pass
        
        # Parse booleans manually (if they're in 0/1 format from CSV)
        for col in ["holiday_flag", "promotion_flag", "anomaly_flag", "supply_constraint_flag"]:
            if col in record:
                val = record[col]
                if val in [0, 1]:
                    record[col] = bool(val)
                elif pd.isna(val):
                    record[col] = None
        # If weather_type is 'none', clear severity to satisfy model validator
        if record.get("weather_type") == "none":
            record["weather_severity"] = None
        
        # Handle NaN values for optional fields
        for key, value in record.items():
            if pd.isna(value):
                record[key] = None
        
        try:
            valid = ForecastRow(**record)
            valid_rows.append(valid)
        except ValidationError as e:
            invalid_rows.append({
                "row_index": idx,
                "errors": e.errors(),
                "raw_data": record
            })
    
    return valid_rows, invalid_rows