from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import tempfile
import shutil
from typing import List
from app.utils.file_loader import ingest_forecast_csv
from app.models.forecast_row import ForecastRow
import os

router = APIRouter()

@router.post("/api/ingest/csv")
async def upload_csv(file: UploadFile = File(...)):
    # Add file size check
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    # Read content for size check, then rewind for actual processing
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large")
    await file.seek(0)
    
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    tmp_path = None
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        # Process the CSV
        valid_rows, invalid_rows = ingest_forecast_csv(tmp_path)
        # Return simplified counts for test compatibility
        return {
            "valid_row_count": len(valid_rows),
            "invalid_row_count": len(invalid_rows)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")
    
    finally:
        # Clean up temporary file
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)
