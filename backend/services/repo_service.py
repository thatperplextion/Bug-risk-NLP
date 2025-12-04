import uuid
from typing import Any
from fastapi import UploadFile
from .db import get_database


class RepoService:
    @staticmethod
    async def queue_project(req: Any) -> str:
        db = get_database()
        project_id = str(uuid.uuid4())
        await db.upsert_project({
            "_id": project_id,
            "name": req.source_ref.split('/')[-1].replace('.git', '') if isinstance(req.source_ref, str) else "project",
            "source_type": req.source_type,
            "source_ref": req.source_ref,
            "languages": [],
            "status": "queued"
        })
        return project_id

    @staticmethod
    async def queue_zip(file: UploadFile) -> str:
        db = get_database()
        project_id = str(uuid.uuid4())
        await db.upsert_project({
            "_id": project_id,
            "name": file.filename,
            "source_type": "zip",
            "source_ref": file.filename,
            "languages": [],
            "status": "queued"
        })
        return project_id
