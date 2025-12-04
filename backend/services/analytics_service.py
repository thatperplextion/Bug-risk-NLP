from .db import db

class AnalyticsService:
    @staticmethod
    async def fetch_metrics(project_id: str, limit: int, sort: str | None):
        metrics = await db.get_metrics(project_id)
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
            "total": len(metrics),
            "updated_at": "now"
        }

    @staticmethod
    async def fetch_risks(project_id: str, tier: str | None, top: int):
        items = await db.get_risks(project_id)
        if tier:
            items = [i for i in items if i.get("tier", "").lower() == tier.lower()]
        avg = round(sum(i.get("risk_score", 0) for i in items) / max(len(items), 1)) if items else 0
        high_count = sum(1 for i in items if i.get("tier") == "High")
        critical_count = sum(1 for i in items if i.get("tier") == "Critical")
        return {
            "project_id": project_id,
            "summary": {
                "avg_risk": avg,
                "high": high_count,
                "critical": critical_count,
                "total": len(items)
            },
            "items": sorted(items, key=lambda x: x.get("risk_score", 0), reverse=True)[:top]
        }

    @staticmethod
    async def fetch_smells(project_id: str, severity: int | None = None):
        smells = await db.get_smells(project_id)
        if severity is not None:
            smells = [s for s in smells if s.get("severity", 0) >= severity]
        
        # Group by type
        type_counts = {}
        for s in smells:
            t = s.get("type", "Unknown")
            type_counts[t] = type_counts.get(t, 0) + 1
        
        smell_types = [
            {"name": name, "count": count}
            for name, count in type_counts.items()
        ]
        
        # Get unique affected files
        affected_files = len(set(s.get("file_path", "") for s in smells))
        
        return {
            "project_id": project_id,
            "total": len(smells),
            "affected_files": affected_files,
            "types": smell_types,
            "items": smells
        }
