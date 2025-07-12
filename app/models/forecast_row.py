from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal, Dict, Any
from datetime import date

class ForecastRow(BaseModel):
    # Core identifiers
    sku_id: str
    store_id: str
    forecast_date: date
    generated_at: date
    
    # Demand predictions
    predicted_demand: int = Field(..., ge=0, description="Predicted demand units")
    hist_sales_1w: Optional[int] = Field(None, ge=0, description="Sales from last week")
    hist_sales_4w_avg: Optional[int] = Field(None, ge=0, description="4-week average sales")
    conf_interval_lower: Optional[int] = Field(None, ge=0, description="Lower confidence bound")
    conf_interval_upper: Optional[int] = Field(None, ge=0, description="Upper confidence bound")
    
    # External factors
    weather_type: Optional[Literal["rain", "sunny", "cloudy", "snow", "none"]] = None
    weather_severity: Optional[int] = Field(None, ge=0, le=3, description="0=mild, 3=severe")
    holiday_flag: Optional[bool] = None
    event_type: Optional[str] = None
    promotion_flag: Optional[bool] = None
    social_sentiment_score: Optional[float] = Field(None, ge=-1.0, le=1.0, description="Sentiment: -1=negative, 1=positive")
    
    # Operational flags
    anomaly_flag: Optional[bool] = None
    supply_constraint_flag: Optional[bool] = None
    
    # Explanatory data
    narrative_explanation: Optional[str] = None
    top_influencer: Optional[str] = None
    structured_explanation: Optional[Dict[str, Any]] = None
    
    @field_validator("weather_severity")
    @classmethod
    def validate_weather_severity(cls, v, info):
        weather_type = info.data.get("weather_type")
        # If weather_type is 'none', always clear severity to avoid validation errors
        if weather_type == "none":
            return None
        return v
    
    @field_validator("conf_interval_upper")
    @classmethod
    def check_confidence_bounds(cls, v, info):
        lower = info.data.get("conf_interval_lower")
        if lower is not None and v is not None and v < lower:
            raise ValueError("conf_interval_upper cannot be less than conf_interval_lower")
        return v
    
    @field_validator("social_sentiment_score")
    @classmethod
    def check_promotion_sentiment_consistency(cls, v, info):
        promotion_flag = info.data.get("promotion_flag")
        if promotion_flag is True and v is None:
            import warnings
            warnings.warn(
                "promotion_flag is True but social_sentiment_score is None. "
                "Consider providing sentiment data for promotional periods.",
                UserWarning
            )
        return v