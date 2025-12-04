from .db import InMemoryDB

class AnalyticsService:
    @staticmethod
    async def fetch_metrics(project_id: str, limit: int, sort: str | None):
        metrics = InMemoryDB.get_metrics(project_id)
        # naive sort parser like "cyclomatic_max:-1"
        if sort:
            try:
                field, direction = sort.split(":")
                reverse = direction.strip() == "-1"
                metrics = sorted(metrics, key=lambda m: m.get(field, 0), reverse=reverse)
            except Exception:
                pass
        return {
            "project_id": project_id,
            "metrics": metrics[:limit],
            "updated_at": "now"
        }

    @staticmethod
    async def fetch_risks(project_id: str, tier: str | None, top: int):
        items = InMemoryDB.get_risks(project_id)
        if tier:
            items = [i for i in items if i["tier"].lower() == tier.lower()]
        avg = round(sum(i.get("risk_score", 0) for i in items) / max(len(items), 1)) if items else 0
        return {
            "project_id": project_id,
            "summary": {"avg_risk": avg, "high": sum(1 for i in items if i.get("tier") == "High"), "critical": sum(1 for i in items if i.get("tier") == "Critical")},
            "items": items[:top]
        }
