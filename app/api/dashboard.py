from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta
from app.models.forecast_row import ForecastRow
from app.models.forecast_explaination import ForecastExplanation
from app.services.forecast_explainer import generate_forecast_explanation

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/tiles", response_model=List[Dict[str, Any]])
async def get_tiles(
    sku: Optional[str] = Query(None),
    start: Optional[str] = Query(None),
    end: Optional[str] = Query(None),
    store: Optional[str] = Query(None),
    signals: Optional[List[str]] = Query(None)
):
    # ... existing logic for tiles
    return [
        {"title": "Filtered SKU", "value": sku or "All"},
        {"title": "Date Range", "value": f"{start or 'begin'} to {end or 'today'}"},
        {"title": "Store", "value": store or "All"},
        {"title": "Signals", "value": signals or []}
    ]

@router.get("/chart", response_model=Dict[str, Any])
async def get_chart_data(
    sku: Optional[str] = Query(None),
    start: Optional[str] = Query(None),
    end: Optional[str] = Query(None),
    store: Optional[str] = Query(None),
    signals: Optional[List[str]] = Query(None)
):
    # ... existing chart logic
    today = date.today()
    dates = [(today - timedelta(days=i)).isoformat() for i in range(6, -1, -1)]
    base = 100 if not sku else 50
    values = [base + i * 5 for i in range(len(dates))]
    return {"labels": dates, "values": values}

# Drill-through endpoint for KPI details
def drill_endpoint_contents(metric: str) -> Dict[str, Any]:
    # Placeholder drill data
    return {
        "columns": ["SKU", "Detail1", "Detail2"],
        "rows": [["SKU123", "Value A1", "Value B1"], ["SKU456", "Value A2", "Value B2"]]
    }

@router.get("/drill", response_model=Dict[str, Any])
async def drill_down(metric: str = Query(..., description="KPI to drill into")):
    return drill_endpoint_contents(metric)

# Detail explanation endpoint for the modal
@router.get("/detail", response_model=ForecastExplanation)
async def get_detail(
    sku: str = Query(..., description="SKU identifier"),
    store: str = Query(..., description="Store identifier"),
    forecast_date: str = Query(..., description="Forecast date (YYYY-MM-DD)"),
    generated_at: Optional[str] = Query(None, description="Generated-at date (YYYY-MM-DD)"),
    weather_severity: Optional[int] = Query(None, ge=0, le=3),
    promotion_discount: Optional[int] = Query(None, ge=0, le=100)
):
    # Parse forecast_date
    try:
        f_date = datetime.strptime(forecast_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid forecast_date format; expected YYYY-MM-DD")
    # Parse generated_at or default to today
    if generated_at:
        try:
            g_date = datetime.strptime(generated_at, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid generated_at format; expected YYYY-MM-DD")
    else:
        g_date = date.today()

    # Build a minimal ForecastRow; set dummy predicted_demand
    forecast = ForecastRow(
        sku_id=sku,
        store_id=store,
        forecast_date=f_date,
        generated_at=g_date,
        predicted_demand=0,
        weather_severity=weather_severity,
        promotion_flag=False
    )
    # Generate explanation with overrides
    explanation = generate_forecast_explanation(
        forecast,
        weather_severity_override=weather_severity,
        promotion_discount_override=promotion_discount
    )
    return explanation



@router.post("/chat", response_model=ForecastExplanation)
async def chat_explain(query: Dict[str, Any]):
    """
    Accepts a small JSON payload with sku_id, store_id, forecast_date, generated_at, plus a
    'question' key (e.g. "Why is demand up?"), and returns one ForecastExplanation.
    """
    # Extract and validate a ForecastRow from query
    base = ForecastRow(**query)
    # You could pass the question through to your LLM prompt logic
    return generate_forecast_explanation(base, extra_question=query.get("question"))

# Drill‑through endpoint for KPI details
@router.get("/drill", response_model=Dict[str, Any])
async def drill_down(
    metric: str = Query(..., description="KPI to drill into")
):
    """
    Drill‑through data for a given KPI metric.
    """
    # Placeholder drill data; replace with real logic
    columns = ["SKU", "Detail 1", "Detail 2"]
    rows = [
        ["SKU123", "Value A1", "Value B1"],
        ["SKU456", "Value A2", "Value B2"],
    ]
    return {"columns": columns, "rows": rows}

@router.get("/confidence-history", response_model=Dict[str, Any])
async def get_confidence_history(
    sku: str = Query(..., description="SKU ID to get confidence history for"),
    store: str = Query(..., description="Store ID to get confidence history for")
):
    """
    Returns confidence score history for the last 7 explanations for a given SKU/store combination.
    Used for rendering confidence sparkline trends.
    """
    today = date.today()
    history = []

    # Simulated confidence values - replace with actual DB fetch
    # This creates a realistic wavy pattern with some variance
    base_scores = [0.72, 0.68, 0.75, 0.82, 0.78, 0.85, 0.88]
    
    for i in range(7):
        dt = today - timedelta(days=6 - i)
        # Add some realistic variance to base scores
        confidence_score = base_scores[i]
        
        # Adjust based on SKU/store for some variety
        if "premium" in sku.lower():
            confidence_score = min(confidence_score + 0.05, 1.0)
        elif "clearance" in sku.lower():
            confidence_score = max(confidence_score - 0.1, 0.0)
            
        history.append({
            "date": dt.isoformat(),
            "confidence": round(confidence_score, 3)
        })

    return {
        "sku_id": sku,
        "store_id": store,
        "history": history
    }

@router.get("/explain")
async def get_explanation(
    sku: str = Query(...),
    store: str = Query(...),
    date: str = Query(...)
):
    """
    Standalone explanation endpoint used by frontend modals (fallback).
    """
    return {
        "narrative_explanation": f"Sales uplift detected for SKU {sku} at {store} on {date}.",
        "confidence_score": 0.84,
        "top_influencer": "Social Trends",
        "structured_explanation": {
            "reason": "Influencer campaign engagement",
            "impact": "+8.2%"
        }
    }
