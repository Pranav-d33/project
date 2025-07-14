from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import logging

router = APIRouter()

@router.post("/api/analytics")
async def log_analytics_event(request: Request):
    try:
        data = await request.json()
        logging.info(f"[Analytics] {data}")
        return JSONResponse(status_code=204, content={})
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})
