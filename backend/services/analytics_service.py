class AnalyticsService:
    @staticmethod
    async def fetch_metrics(project_id: str, limit: int, sort: str | None):
        # Mock metrics list
        return {
            "project_id": project_id,
            "metrics": [
                {"path": "src/a.py", "loc": 120, "cyclomatic_max": 8},
                {"path": "src/auth.py", "loc": 420, "cyclomatic_max": 14},
            ][:limit],
            "updated_at": "now"
        }

    @staticmethod
    async def fetch_risks(project_id: str, tier: str | None, top: int):
        items = [
            {"path": "src/auth.py", "risk_score": 81, "tier": "Critical", "top_features": []},
            {"path": "src/utils.py", "risk_score": 68, "tier": "High", "top_features": []},
        ]
        if tier:
            items = [i for i in items if i["tier"].lower() == tier.lower()]
        return {
            "project_id": project_id,
            "summary": {"avg_risk": 48, "high": 1, "critical": 1},
            "items": items[:top]
        }
