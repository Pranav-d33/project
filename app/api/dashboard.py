from fastapi import APIRouter, Query, HTTPException, Body
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta
from app.models.forecast_row import ForecastRow
from app.models.forecast_explaination import ForecastExplanation
from app.services.forecast_explainer import generate_forecast_explanation
from app.services.storycards import generate_narrative_storycards

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/copilot")
async def get_copilot_response(default: bool = Query(False)):
    """
    If ?default=true is passed, return starter suggestions instead of dynamic LLM response.
    """
    if default:
        return {
            "greeting": "Hi 👋 I'm your Forecast Assistant. Ask me anything about demand trends, events, or promotions.",
            "suggestions": [
                "Why is raincoat demand rising in Mumbai?",
                "What's the biggest influencer for SKU-432?",
                "Which stores saw anomalies last week?",
                "When is the next high-demand day in Bangalore?",
            ]
        }
    # Optional: fallback logic for actual chat response
    return JSONResponse(content={"message": "Chat response logic not implemented"}, status_code=501)

@router.post("/copilot")
async def copilot_handler(payload: Dict[str, Any] = Body(...)):
    """
    Handle natural language queries via Copilot: inject filters and call LLM agent.
    """
    query = payload.get("query")
    filters = payload.get("filters", {})
    if not query:
        raise HTTPException(status_code=400, detail="Missing query")
    # Delegate to copilot agent service
    from app.services.copilot_agent import run_copilot_query
    return run_copilot_query(query, filters)

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

@router.get("/metrics", response_model=List[Dict[str, Any]])
async def get_metrics(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    sku: Optional[str] = Query(None, description="SKU filter"),
    store: Optional[str] = Query(None, description="Store filter")
):
    """
    Return KPI metric tiles for the dashboard.
    """
    # Mock data based on filters
    return [
        {
            "key": "accuracy",
            "title": "Forecast Accuracy",
            "value": "87.3%",
            "trend": "+2.1%",
            "color": "green"
        },
        {
            "key": "confidence",
            "title": "Avg Confidence",
            "value": "0.84",
            "trend": "+0.05",
            "color": "blue"
        },
        {
            "key": "missed",
            "title": "Missed Forecasts",
            "value": "12",
            "trend": "-3",
            "color": "red"
        },
        {
            "key": "override",
            "title": "AI Overrides",
            "value": "8",
            "trend": "+1",
            "color": "orange"
        }
    ]

@router.get("/drill", response_model=Dict[str, Any])
async def drill_down(metric: str = Query(..., description="KPI to drill into")):
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

@router.post("/explain/single", response_model=ForecastExplanation)
async def explain_single(payload: Dict[str, Any] = Body(...)):
    """
    Accepts JSON body with sku_id, store_id, and forecast_date to generate a ForecastExplanation.
    """
    # Construct ForecastRow; generated_at and other flags defaulted or omitted
    row = ForecastRow(
        sku_id=payload.get('sku_id'),
        store_id=payload.get('store_id'),
        forecast_date=datetime.strptime(payload.get('forecast_date'), '%Y-%m-%d').date(),
        generated_at=date.today(),
        predicted_demand=0
    )
    explanation = generate_forecast_explanation(row)
    return explanation
 
@router.get("/storycards", response_model=List[Dict[str, Any]])
async def get_storycards(
    start: date = Query(...),
    end: date = Query(...),
    sku: Optional[str] = Query(None),
    store: Optional[str] = Query(None),
    signals: List[str] = Query(default=[])
):
    """
    Generate narrative storycards for given date range, SKU, store, and signals.
    """
    cards = generate_narrative_storycards(start, end, sku, store, signals)
    return cards