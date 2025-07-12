from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, Any
from datetime import date

class ForecastExplanation(BaseModel):
    # Core identifiers
    sku_id: str
    store_id: str
    forecast_date: date  # Use date type instead of string
    
    # Explanation content
    narrative_explanation: str = Field(..., description="Human-readable summary")
    top_influencer: Optional[Literal[
        "weather", "holiday", "event", "promotion", "social_trend", 
        "historical_pattern", "supply_constraint", "anomaly", "unknown"
    ]] = Field("unknown", description="Primary driver")
    
    # Enhanced structured explanation
    structured_explanation: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Detailed factor impacts: { factor: impact_data }"
    )
    
    # Optional: Confidence and metadata
    confidence_score: Optional[float] = Field(
        None, ge=0.0, le=1.0, 
        description="Explanation confidence (0-1)"
    )
    explanation_type: Optional[Literal["ai_generated", "rule_based", "manual"]] = "ai_generated"