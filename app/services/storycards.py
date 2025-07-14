from typing import List, Dict, Any, Optional
from datetime import date


def generate_narrative_storycards(
    start: date,
    end: date,
    sku: Optional[str] = None,
    store: Optional[str] = None,
    signals: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    Generate narrative storycards for the given filters.
    Returns a list of dicts with keys: type, title, subtitle, body, confidence, primary_driver, action.
    """
    # Dummy storycards data for testing layout
    cards: List[Dict[str, Any]] = []
    # Example anomaly card
    cards.append({
        "type": "anomaly",
        "title": f"Anomaly detected: {sku or 'All SKUs'}",
        "subtitle": f"{store or 'All Stores'} {end.isoformat()}",
        "body": "Unexpected spike in sales detected.",
        "confidence": 0.95,
        "primary_driver": "anomaly",
        "action": {
            "label": "Explain",
            "params": {
                "sku_id": sku,
                "store_id": store,
                "forecast_date": end.isoformat()
            }
        }
    })
    # Example driver card
    cards.append({
        "type": "driver",
        "title": "Top driver changed",
        "subtitle": f"{sku or 'All SKUs'} week ending {end.isoformat()}",
        "body": "Promotional activity became the primary driver.",
        "confidence": 0.88,
        "primary_driver": "promotion",
        "action": {
            "label": "Explain",
            "params": {
                "sku_id": sku,
                "store_id": store,
                "forecast_date": end.isoformat()
            }
        }
    })
    # Example insight card
    cards.append({
        "type": "insight",
        "title": "Stable forecasts",
        "subtitle": f"{start.isoformat()} to {end.isoformat()}",
        "body": "Forecasts remained within expected ranges.",
        "confidence": 0.80,
        "primary_driver": "historical_pattern",
        "action": {
            "label": "More",
            "params": {}
        }
    })
    return cards
