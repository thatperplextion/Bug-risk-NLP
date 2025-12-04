class LLMService:
    @staticmethod
    async def fetch_suggestions(file_id: str, limit: int):
        return {
            "file_id": file_id,
            "path": "src/auth.py",
            "suggestions": [
                {"title": "Extract provider", "rationale": "Modularity", "est_hours": 6, "priority": "High"},
                {"title": "Rename variables", "rationale": "Clarity", "est_hours": 1, "priority": "Medium"},
            ][:limit]
        }
