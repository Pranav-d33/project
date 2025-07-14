from fastapi import FastAPI, Request, UploadFile, File, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api import ingest, explain
from app.utils.file_loader import ingest_forecast_csv
import shutil
import os
import redis
from dotenv import load_dotenv
import logging
from app.api.dashboard import router as dashboard_router
from app.api.analytics import router as analytics_router


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logging.getLogger("app.services.forecast_explainer").setLevel(logging.DEBUG)

# Load environment variables
load_dotenv()

# Verify API key is loaded
if not os.getenv("GOOGLE_API_KEY"):
    logger.warning("⚠️ GOOGLE_API_KEY not found in environment")
else:
    logger.info("✅ GOOGLE_API_KEY loaded successfully")

app = FastAPI(
    title="Walmart Retail Forecast API",
    version="1.0.0",
    description="AI-powered demand forecasting with explanations - Upload CSV data and get intelligent insights",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware for web interface
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files and templates before routes
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Include API routers
app.include_router(ingest.router, tags=["Data Ingestion"])
app.include_router(explain.router, tags=["Forecast Explanations"])
app.include_router(dashboard_router)
app.include_router(analytics_router)

@app.on_event("startup")
def on_startup():
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    try:
        client = redis.from_url(redis_url, decode_responses=True)
        client.ping()
        app.state.redis = client
        logging.info("✅ Connected to Redis")
    except Exception as e:
        app.state.redis = None
        logging.warning(f"⚠️ Redis connection failed: {e}. Caching disabled.")
async def startup_event():
    """Initialize app on startup"""
    # Create necessary directories
    directories = ["uploads", "static", "templates"]
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"📁 Ensured directory exists: {directory}")
    
    # Test Redis connection (optional)
    try:
        import redis
        redis_client = redis.Redis(host='localhost', port=6379, db=0)
        redis_client.ping()
        logger.info("✅ Redis connection successful")
    except Exception as e:
        logger.warning(f"⚠️ Redis connection failed: {e}")
    
    logger.info("🚀 Walmart Forecasting API started successfully!")
    logger.info("📊 Ready to process demand forecasts and generate explanations")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("👋 Walmart Forecasting API shutting down...")
@app.get("/api/explain")
def explain(sku: str = Query(...), store: str = Query(...), date: str = Query(...)):
    # You can replace this with your real logic
    return {
        "narrative_explanation": f"Explanation for {sku} at {store} on {date}",
        "confidence_score": 0.84,
        "top_influencer": "Social Trends",
        "structured_explanation": {"reason": "Promo uplift", "impact": "+8%"}
    }
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Walmart Demand Forecasting API",
        "version": "1.0.0",
        "description": "AI-powered demand forecasting with explanations",
        "docs": "/docs",
        "redoc": "/redoc",
        "web_ui": "/ui",
        "endpoints": {
            "upload_csv": "/api/ingest/csv",
            "explain_single": "/api/explain/single",
            "explain_batch": "/api/explain/batch",
            "explain_from_cache": "/api/explain/from-cache/{session_id}",
            "health_check": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    health_status = {
        "status": "healthy",
        "service": "walmart-forecasting-api",
        "version": "1.0.0"
    }
    
    # Check environment variables
    health_status["gemini_api_configured"] = bool(os.getenv("GEMINI_API_KEY"))
    
    # Check Redis availability
    try:
        import redis
        redis_client = redis.Redis(host='localhost', port=6379, db=0)
        redis_client.ping()
        health_status["redis_available"] = True
    except Exception:
        health_status["redis_available"] = False
    
    return health_status

@app.get("/ui", response_class=RedirectResponse)
async def redirect_to_ui():
    """Redirect to web interface"""
    return RedirectResponse("/web-ui")

@app.get("/web-ui")
async def show_ui(request: Request):
    """Serve the web interface"""
    return templates.TemplateResponse("index.html", {
        "request": request,
        "api_docs": "/docs",
        "api_endpoints": {
            "upload": "/api/ingest/csv",
            "explain": "/api/explain/single"
        }
    })
@app.get("/dashboard")
async def dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.post("/upload")
async def upload_csv_web(request: Request, file: UploadFile = File(...)):
    """Web interface CSV upload endpoint"""
    
    # Validate file
    if not file.filename.endswith('.csv'):
        error_result = {
            "error": "Only CSV files are supported",
            "valid_count": 0,
            "invalid_count": 0,
            "invalid_rows": []
        }
        return templates.TemplateResponse("index.html", {"request": request, "result": error_result})
    
    # Check file size (10MB limit)
    MAX_FILE_SIZE = 10 * 1024 * 1024
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        error_result = {
            "error": "File too large (max 10MB)",
            "valid_count": 0,
            "invalid_count": 0,
            "invalid_rows": []
        }
        return templates.TemplateResponse("index.html", {"request": request, "result": error_result})
    
    # Reset file pointer
    await file.seek(0)
    
    # Ensure uploads directory exists
    os.makedirs("uploads", exist_ok=True)
    
    # Save uploaded file with timestamp to avoid conflicts
    import time
    timestamp = int(time.time())
    safe_filename = f"{timestamp}_{file.filename}"
    file_path = f"uploads/{safe_filename}"
    
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    try:
        logger.info(f"Processing uploaded file: {file.filename}")
        
        # Ingest logic
        valid_rows, invalid_rows = ingest_forecast_csv(file_path)
        
        # Calculate success rate
        total_rows = len(valid_rows) + len(invalid_rows)
        success_rate = (len(valid_rows) / total_rows * 100) if total_rows > 0 else 0
        
        result = {
            "filename": file.filename,
            "total_rows": total_rows,
            "valid_count": len(valid_rows),
            "invalid_count": len(invalid_rows),
            "success_rate": round(success_rate, 2),
            "invalid_rows": invalid_rows[:10],  # Show only first 10 errors
            "processing_success": True
        }
        
        logger.info(f"Successfully processed {file.filename}: {len(valid_rows)} valid, {len(invalid_rows)} invalid")
        
        return templates.TemplateResponse("index.html", {"request": request, "result": result})
    
    except Exception as e:
        logger.error(f"Error processing file {file.filename}: {str(e)}")
        error_result = {
            "error": f"Error processing file: {str(e)}",
            "filename": file.filename,
            "valid_count": 0,
            "invalid_count": 0,
            "invalid_rows": [],
            "processing_success": False
        }
        return templates.TemplateResponse("index.html", {"request": request, "result": error_result})
    
    finally:
        # Clean up uploaded file
        try:
            if os.path.exists(file_path):
                os.unlink(file_path)
                logger.info(f"Cleaned up temporary file: {file_path}")
        except Exception as e:
            logger.warning(f"Failed to clean up file {file_path}: {e}")

from typing import List, Optional
# ...existing code...

"""
Dashboard API Endpoints for Premium Dashboard UI
"""

# 1. Metrics Endpoint
@app.get("/api/dashboard/metrics")
async def get_dashboard_metrics(
    start_date: str = Query(...),
    end_date: str = Query(...),
    sku: Optional[str] = Query(None),
    store: Optional[str] = Query(None)
):
    # TODO: Replace with real computation from your data source
    return {
        "forecast_accuracy": 0.92,
        "confidence_score": 0.84,
        "missed_skus": 12,
        "ai_override_pct": 0.18,
        "top_influencer_breakdown": {
            "Weather": 0.4,
            "Promo": 0.3,
            "Social": 0.2,
            "Other": 0.1
        }
    }

# 2. Time-Series Data Endpoint
@app.get("/api/dashboard/timeseries")
async def get_timeseries(
    start_date: str = Query(...),
    end_date: str = Query(...),
    sku: Optional[str] = Query(None),
    store: Optional[str] = Query(None)
):
    # TODO: Replace with real data
    return [
        {
            "date": "2025-07-01",
            "actual": 120,
            "predicted": 130,
            "overlays": ["holiday", "rain"]
        },
        {
            "date": "2025-07-02",
            "actual": 110,
            "predicted": 125,
            "overlays": ["event"]
        },
    ]

# 3. Explanations Endpoint (Batch)
from fastapi import Body
@app.post("/api/dashboard/explanations")
async def get_explanations(batch: List[dict] = Body(...)):
    # TODO: Replace with real LLM logic
    return [
        {
            "sku": row.get("sku", "SKU-231"),
            "store": row.get("store", "Bangalore"),
            "date": row.get("date", "2025-07-10"),
            "narrative_explanation": "Demand is low due to heavy rainfall and negative social sentiment.",
            "confidence_score": 0.84,
            "top_influencer": "Social Trends",
            "structured_explanation": {"reason": "Promo uplift", "impact": "+8%"}
        }
        for row in batch
    ]

# 4. Storycards Endpoint
@app.get("/api/dashboard/storycards")
async def get_storycards(
    start_date: str = Query(...),
    end_date: str = Query(...),
    store: Optional[str] = Query(None)
):
    # TODO: Replace with real story generation
    return [
        {
            "headline": "Raincoat demand spiked in Chennai due to Cyclone Biparjoy (↑38%)",
            "date": "2025-07-05",
            "impact": 0.38,
            "type": "spike"
        },
        {
            "headline": "T-shirts dropped post IPL finals across North Tier 1 stores",
            "date": "2025-07-08",
            "impact": -0.22,
            "type": "drop"
        },
    ]

# 5. Copilot/Chat Endpoint
@app.post("/api/dashboard/copilot")
async def copilot_qa(query: str = Body(...)):
    # TODO: Integrate with LLM for real answers
    return {"answer": "Demand is low due to heavy rainfall and negative social sentiment."}

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Custom 404 handler"""
    return templates.TemplateResponse("404.html", {"request": request}, status_code=404)

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """Custom 500 handler"""
    logger.error(f"Internal server error: {exc}")
    return templates.TemplateResponse("500.html", {"request": request}, status_code=500)

# Development info
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
#docker run -d --name redis -p 6379:6379 redis:7
# Production: uvicorn app.main:app --host 0.0.0.0 --port 8000
# Development: uvicorn app.main:app --reload