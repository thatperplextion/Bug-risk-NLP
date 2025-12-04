from fastapi import APIRouter, HTTPException
from services.analytics_service import AnalyticsService
from services.db import get_database
import traceback
import sys

router = APIRouter()

@router.get("/{project_id}")
async def get_metrics(project_id: str, limit: int = 50, sort: str | None = None):
    try:
        print(f"[DEBUG] get_metrics called for project: {project_id}", file=sys.stderr, flush=True)
        db = get_database()
        print(f"[DEBUG] DB instance: {type(db).__name__}, connected: {getattr(db, '_connected', 'N/A')}", file=sys.stderr, flush=True)
        result = await AnalyticsService.fetch_metrics(project_id, limit, sort)
        print(f"[DEBUG] Got {result.get('total', 0)} metrics", file=sys.stderr, flush=True)
        return result
    except Exception as e:
        print(f"[ERROR] Error fetching metrics: {e}", file=sys.stderr, flush=True)
        traceback.print_exc(file=sys.stderr)
        raise HTTPException(status_code=500, detail=str(e))
