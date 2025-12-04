from fastapi import APIRouter
from services.analytics_service import AnalyticsService

router = APIRouter()

@router.get("/{project_id}")
async def get_smells(project_id: str, severity: int | None = None):
    return await AnalyticsService.fetch_smells(project_id, severity)
