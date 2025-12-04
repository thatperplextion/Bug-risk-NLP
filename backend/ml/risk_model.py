class RiskModel:
    VERSION = "rf-0.0"

    @staticmethod
    def predict_proba(features: dict) -> float:
        # Dummy probability based on simple heuristic
        score = 0.0
        score += min(features.get("cyclomatic_max", 0)/20, 1)
        score += min(features.get("dup_ratio", 0)*2, 1)
        score += min(features.get("loc", 0)/1000, 1)
        return min(score/3, 1.0)

    @staticmethod
    def to_risk(proba: float) -> int:
        return round(100 * proba)

    @staticmethod
    def to_tier(risk: int) -> str:
        if risk <= 30:
            return "Low"
        if risk <= 60:
            return "Medium"
        if risk <= 80:
            return "High"
        return "Critical"
