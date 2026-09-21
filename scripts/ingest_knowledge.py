
"""
Index the policy documents into pgvector.

    python scripts/ingest_knowledge.py                  # index documents/
    python scripts/ingest_knowledge.py --force          # reindex everything
    python scripts/ingest_knowledge.py --dir ./policies # a different folder
    python scripts/ingest_knowledge.py --clear          # wipe the index first

Run this once after migrations, and again whenever a policy document changes.
Unchanged files are skipped automatically by content hash, so re-running is
cheap and safe.

Use --force after changing EMBEDDING_MODEL or the chunk size: existing vectors
were produced by the old settings and mixing them with new ones degrades
retrieval in ways that are very hard to notice.
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.ai_config import ai_settings
from app.db.database import SessionLocal
from app.rag.ingest import clear_knowledge_base, ingest_directory

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("ingest")


def main() -> int:
    parser = argparse.ArgumentParser(description="Index policy documents for RAG.")
    parser.add_argument("--dir", default=ai_settings.KNOWLEDGE_DOCS_DIR)
    parser.add_argument("--force", action="store_true", help="reindex unchanged files")
    parser.add_argument("--clear", action="store_true", help="delete the index first")
    args = parser.parse_args()

    if not ai_settings.OPENROUTER_API_KEY:
        logger.error("OPENROUTER_API_KEY is not set. Copy .env.example to .env first.")
        return 1

    directory = Path(args.dir)
    if not directory.is_dir():
        logger.error("%s is not a directory", directory)
        return 1

    db = SessionLocal()
    try:
        if args.clear:
            removed = clear_knowledge_base(db)
            logger.info("Cleared %d document(s) from the index", removed)

        logger.info(
            "Indexing %s with %s (%d dims)",
            directory,
            ai_settings.EMBEDDING_MODEL,
            ai_settings.EMBEDDING_DIM,
        )
        results = ingest_directory(db, directory=str(directory), force=args.force)

        if not results:
            logger.warning("Nothing to index - is %s empty?", directory)
            return 1

        print()
        print(f"{'FILE':<34} {'STATUS':<10} {'CHUNKS':>7}")
        print("-" * 54)
        for result in results:
            print(f"{result.filename:<34} {result.status:<10} {result.chunk_count:>7}")
            if result.detail and result.status == "failed":
                print(f"{'':<34} -> {result.detail}")

        failed = sum(1 for r in results if r.status == "failed")
        total_chunks = sum(r.chunk_count for r in results)
        print("-" * 54)
        print(f"{len(results)} file(s), {total_chunks} chunk(s), {failed} failed")

        return 1 if failed else 0

    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
