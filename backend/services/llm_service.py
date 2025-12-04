class LLMService:
    @staticmethod
    async def fetch_suggestions(file_id: str, limit: int):
        return {
            "file_id": file_id,
            "path": "src/example.py",
            "suggestions": [
                {"title": "Extract function", "rationale": "Function exceeds recommended length", "est_hours": 2, "snippet": "def long_fn(...)\n    pass", "priority": "High"},
                {"title": "Rename variable", "rationale": "Inconsistent naming", "est_hours": 1, "snippet": "x = value", "priority": "Medium"}
            ][:limit]
        }
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
