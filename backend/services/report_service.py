class ReportService:
    @staticmethod
    async def generate_pdf(project_id: str, sections: list[str]) -> bytes:
        # Placeholder PDF bytes
        content = f"CodeSenseX Report for {project_id}\nSections: {', '.join(sections)}".encode("utf-8")
        return content
