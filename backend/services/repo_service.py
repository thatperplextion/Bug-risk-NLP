import uuid
from typing import Any
from fastapi import UploadFile
from .db import InMemoryDB

class RepoService:
    @staticmethod
    async def queue_project(req: Any) -> str:
        project_id = str(uuid.uuid4())
        InMemoryDB.upsert_project({
            "_id": project_id,
            "name": req.source_ref.split('/')[-1] if isinstance(req.source_ref, str) else "project",
            "source_type": req.source_type,
            "source_ref": req.source_ref,
            "languages": [],
            "status": "queued"
        })
        return project_id

    @staticmethod
    async def queue_zip(file: UploadFile) -> str:
        project_id = str(uuid.uuid4())
        InMemoryDB.upsert_project({
            "_id": project_id,
            "name": file.filename,
            "source_type": "zip",
            "source_ref": file.filename,
            "languages": [],
            "status": "queued"
        })
        return project_id
