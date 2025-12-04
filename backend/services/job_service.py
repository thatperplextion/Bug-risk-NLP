from datetime import datetime
from .db import InMemoryDB
from .analytics_service import AnalyticsService

class JobService:
    @staticmethod
    async def start_scan(project_id: str, options: dict) -> str:
        # Simulate scan: set dummy metrics and risks
        InMemoryDB.set_metrics(project_id, [
            {"path": "src/a.py", "loc": 120, "cyclomatic_max": 8},
            {"path": "src/auth.py", "loc": 420, "cyclomatic_max": 14}
        ])
        InMemoryDB.set_risks(project_id, [
            {"path": "src/auth.py", "risk_score": 81, "tier": "Critical", "top_features": []},
            {"path": "src/utils.py", "risk_score": 68, "tier": "High", "top_features": []}
        ])
        return datetime.utcnow().isoformat()
