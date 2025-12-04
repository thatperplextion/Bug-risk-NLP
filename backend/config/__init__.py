"""
Configuration module for CodeSenseX backend.
"""

from .database import get_database, close_database, ensure_indexes, Collections

__all__ = [
    "get_database",
    "close_database", 
    "ensure_indexes",
    "Collections"
]
