from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from controllers.upload_controller import router as upload_router
from controllers.scan_controller import router as scan_router
from controllers.metrics_controller import router as metrics_router
from controllers.risks_controller import router as risks_router
from controllers.smells_controller import router as smells_router
from controllers.suggestions_controller import router as suggestions_router
from controllers.report_controller import router as report_router
from services.db import db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage database connection lifecycle."""
    # Startup: connect to database
    await db.connect()
    yield
    # Shutdown: close database connection
    await db.close()


app = FastAPI(
    title="CodeSenseX Backend",
    version="0.1.0",
    description="AI-Powered Code Quality & Bug Risk Analyzer",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/upload", tags=["upload"])
app.include_router(scan_router, prefix="/scan", tags=["scan"])
app.include_router(metrics_router, prefix="/metrics", tags=["metrics"])
app.include_router(risks_router, prefix="/risks", tags=["risks"])
app.include_router(smells_router, prefix="/smells", tags=["smells"])
app.include_router(suggestions_router, prefix="/suggestions", tags=["suggestions"])
app.include_router(report_router, prefix="/report", tags=["report"])

@app.get("/")
def root():
    return {"service": "codesensex", "status": "ok"}
