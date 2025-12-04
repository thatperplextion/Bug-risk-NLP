from fastapi import APIRouter
from pydantic import BaseModel
from services.job_service import JobService

router = APIRouter()

class ScanRequest(BaseModel):
    project_id: str
    options: dict | None = None

@router.post("/project")
async def scan_project(req: ScanRequest):
    result = await JobService.start_scan(req.project_id, req.options or {})
    
    if "error" in result:
        return {
            "project_id": req.project_id, 
            "status": "error", 
            "error": result["error"],
            "started_at": result.get("started_at")
        }
    
    return {
        "project_id": req.project_id, 
        "status": result.get("status", "completed"),
        "started_at": result.get("started_at"),
        "completed_at": result.get("completed_at"),
        "summary": result.get("summary", {}),
        "files_analyzed": result.get("files_analyzed", 0),
        "smells_found": result.get("smells_found", 0)
    }
