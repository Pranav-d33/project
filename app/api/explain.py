from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Request
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
import asyncio
from pydantic import BaseModel
from datetime import time, datetime
from app.models.forecast_row import ForecastRow
from app.models.forecast_explaination import ForecastExplanation
from app.services.forecast_explainer import (
    generate_forecast_explanation,
    generate_batch_explanations,
    validate_explanation,
)

router = APIRouter()

# Response models for better API documentation
class BatchExplanationResponse(BaseModel):
    explanations: List[ForecastExplanation]
    summary: Dict[str, Any]
    processing_time_seconds: float

class CacheExplanationResponse(BaseModel):
    session_id: str
    explanations: List[ForecastExplanation]
    summary: Dict[str, Any]
    explanation_cache_key: str

# Dependency for Redis connection
def get_redis_client():
    try:
        import redis
        return redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    except Exception:
        raise HTTPException(status_code=503, detail="Redis service unavailable")

@router.post("/api/explain/single")
async def explain_single(request: Request):
    """
    Generate a single explanation for a given forecast row.
    """
    # Read raw JSON payload
    forecast = await request.json()
    sku = forecast.get("sku_id")
    store = forecast.get("store_id")
    date = forecast.get("forecast_date")
    return {
        "sku_id": sku,
        "store_id": store,
        "forecast_date": date,
        "narrative_explanation": "This is a test explanation.",
        "top_influencer": "historical_pattern",
        "structured_explanation": {},
        "confidence_score": 0.5,
        "explanation_type": "ai_generated"
    }

@router.post("/api/explain/batch")
async def explain_batch(forecasts: List[ForecastRow]):
    """
    Generate batch explanations with improved concurrency and error handling.
    """
    start_time = time.time()
    
    # Enhanced validation
    if len(forecasts) > 100:
        raise HTTPException(status_code=413, detail="Too many rows (limit: 100 per batch)")
    
    if not forecasts:
        raise HTTPException(status_code=400, detail="Empty forecast list provided")

    try:
        # Process with async batching for better performance
        explanations = await process_batch_async(forecasts)
        
        # Enhanced filtering and validation
        valid_explanations = []
        failed_explanations = []
        
        for i, explanation in enumerate(explanations):
            if explanation and validate_explanation(explanation):
                valid_explanations.append(explanation)
            else:
                failed_explanations.append({
                    "index": i,
                    "sku_id": forecasts[i].sku_id,
                    "store_id": forecasts[i].store_id,
                    "reason": "validation_failed" if explanation else "generation_failed"
                })
        
        processing_time = time.time() - start_time
        
        return BatchExplanationResponse(
            explanations=valid_explanations,
            summary={
                "total_requested": len(forecasts),
                "successful": len(valid_explanations),
                "failed": len(failed_explanations),
                "success_rate": round(len(valid_explanations) / len(forecasts) * 100, 2),
                "failed_details": failed_explanations[:5],  # Show first 5 failures
                "processing_time_seconds": round(processing_time, 3)
            },
            processing_time_seconds=round(processing_time, 3)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch explanation error: {str(e)}")

async def process_batch_async(forecasts: List[ForecastRow], batch_size: int = 10) -> List[Optional[ForecastExplanation]]:
    """Process forecasts in smaller batches to avoid API rate limits"""
    results = []
    
    for i in range(0, len(forecasts), batch_size):
        batch = forecasts[i:i + batch_size]
        
        # Process batch with some delay to respect rate limits
        batch_results = generate_batch_explanations(batch)
        results.extend(batch_results)
        
        # Small delay between batches
        if i + batch_size < len(forecasts):
            await asyncio.sleep(0.5)
    
    return results

@router.post("/api/explain/from-cache/{session_id}")
async def explain_from_cached_data(
    session_id: str,
    background_tasks: BackgroundTasks,
    redis_client = Depends(get_redis_client)
):
    """
    Generate explanations for cached forecast data with background processing option.
    """
    try:
        cache_key = f"forecast_session:{session_id}"
        cached_data = redis_client.get(cache_key)
        
        if not cached_data:
            raise HTTPException(status_code=404, detail="Session not found or expired")
        
        # Parse cached data
        import json
        session_data = json.loads(cached_data)
        forecast_dicts = session_data.get("data", [])
        
        # Convert dict data back to ForecastRow objects with better error handling
        forecasts = []
        parsing_errors = []
        
        for i, forecast_dict in enumerate(forecast_dicts):
            try:
                # Handle date parsing
                for date_field in ["forecast_date", "generated_at"]:
                    if date_field in forecast_dict and isinstance(forecast_dict[date_field], str):
                        forecast_dict[date_field] = datetime.strptime(
                            forecast_dict[date_field], "%Y-%m-%d"
                        ).date()
                
                forecast = ForecastRow(**forecast_dict)
                forecasts.append(forecast)
            except Exception as e:
                parsing_errors.append({"index": i, "error": str(e)})
        
        if not forecasts:
            raise HTTPException(
                status_code=400, 
                detail=f"No valid forecast data found. Parsing errors: {len(parsing_errors)}"
            )
        
        # Check if explanations already exist
        explanation_cache_key = f"explanations_session:{session_id}"
        existing_explanations = redis_client.get(explanation_cache_key)
        
        if existing_explanations:
            return JSONResponse(
                content={
                    "session_id": session_id,
                    "explanations": json.loads(existing_explanations),
                    "summary": {
                        "total_forecasts": len(forecasts),
                        "cached": True,
                        "parsing_errors": len(parsing_errors)
                    },
                    "explanation_cache_key": explanation_cache_key
                }
            )
        
        # Generate new explanations
        start_time = time.time()
        explanations = await process_batch_async(forecasts)
        processing_time = time.time() - start_time
        
        # Cache the explanations
        valid_explanations = [exp for exp in explanations if exp]
        background_tasks.add_task(
            cache_explanations,
            redis_client,
            explanation_cache_key,
            valid_explanations
        )
        
        return CacheExplanationResponse(
            session_id=session_id,
            explanations=valid_explanations,
            summary={
                "total_forecasts": len(forecasts),
                "explanations_generated": len(valid_explanations),
                "parsing_errors": len(parsing_errors),
                "processing_time_seconds": round(processing_time, 3),
                "cached": False
            },
            explanation_cache_key=explanation_cache_key
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cache explanation error: {str(e)}")

def cache_explanations(redis_client, cache_key: str, explanations: List[ForecastExplanation]):
    """Background task to cache explanations"""
    try:
        import json
        redis_client.setex(
            cache_key,
            86400,  # 24 hours
            json.dumps([exp.model_dump() for exp in explanations])
        )
    except Exception as e:
        print(f"Failed to cache explanations: {e}")

@router.get("/api/explain/status/{session_id}")
async def get_explanation_status(session_id: str, redis_client = Depends(get_redis_client)):
    """Check if explanations exist for a session"""
    try:
        forecast_key = f"forecast_session:{session_id}"
        explanation_key = f"explanations_session:{session_id}"
        
        forecast_exists = redis_client.exists(forecast_key)
        explanation_exists = redis_client.exists(explanation_key)
        
        if not forecast_exists:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "session_id": session_id,
            "forecast_data_available": bool(forecast_exists),
            "explanations_available": bool(explanation_exists),
            "forecast_ttl": redis_client.ttl(forecast_key),
            "explanation_ttl": redis_client.ttl(explanation_key) if explanation_exists else None
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check error: {str(e)}")

@router.delete("/api/explain/cache/{session_id}")
async def clear_explanation_cache(session_id: str, redis_client = Depends(get_redis_client)):
    """Clear cached explanations for a session"""
    try:
        explanation_key = f"explanations_session:{session_id}"
        deleted = redis_client.delete(explanation_key)
        
        return {
            "session_id": session_id,
            "cleared": bool(deleted),
            "message": "Explanation cache cleared" if deleted else "No cache found"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cache clear error: {str(e)}")