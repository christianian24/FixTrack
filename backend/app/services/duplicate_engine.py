"""
Server-side duplicate detection engine.

Finds existing open concerns in the same location (room/category) whose
title or description is similar to the new submission.

Similarity algorithm:
  1. Token overlap on title (Jaccard similarity ≥ 0.4 → match)
  2. Same room_id AND same category_id (exact location match)
  3. Returns a list of possible duplicate concern IDs + similarity scores
"""
from __future__ import annotations

import re
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.concern import Concern


# ── Text helpers ─────────────────────────────────────────────────────────────

_STOPWORDS = {
    "a", "an", "the", "is", "in", "on", "at", "of", "and", "or",
    "to", "with", "for", "this", "that", "it", "are", "was", "be",
}


def _tokenize(text: str) -> set[str]:
    tokens = re.findall(r"\w+", text.lower())
    return {t for t in tokens if t not in _STOPWORDS and len(t) > 2}


def _jaccard(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


@dataclass
class DuplicateMatch:
    concern_id: str
    tracking_number: str
    title: str
    similarity: float
    reason: str


# ── Main detector ─────────────────────────────────────────────────────────────

OPEN_STATUSES = {
    "SUBMITTED", "UNDER_REVIEW", "ASSIGNED",
    "IN_PROGRESS", "WAITING_FOR_MATERIALS",
}

JACCARD_THRESHOLD = 0.35


async def find_duplicates(
    db: AsyncSession,
    title: str,
    room_id: str | None,
    category_id: str | None,
    exclude_id: str | None = None,
) -> list[DuplicateMatch]:
    """
    Query the DB for open concerns that might be duplicates.
    Returns up to 5 matches sorted by similarity descending.
    """
    q = select(Concern).where(Concern.status.in_(OPEN_STATUSES))
    if exclude_id:
        q = q.where(Concern.id != exclude_id)

    result = await db.execute(q)
    candidates = result.scalars().all()

    title_tokens = _tokenize(title)
    matches: list[DuplicateMatch] = []

    for c in candidates:
        reasons = []
        c_tokens = _tokenize(c.title)
        sim = _jaccard(title_tokens, c_tokens)

        if sim >= JACCARD_THRESHOLD:
            reasons.append(f"Similar title (similarity {sim:.0%})")

        # Exact location + category match is always flagged
        if room_id and c.room_id == room_id and category_id and c.category_id == category_id:
            sim = max(sim, 0.6)  # bump score for location match
            reasons.append("Same room and category")

        if reasons:
            matches.append(
                DuplicateMatch(
                    concern_id=c.id,
                    tracking_number=c.tracking_number,
                    title=c.title,
                    similarity=sim,
                    reason="; ".join(reasons),
                )
            )

    matches.sort(key=lambda m: m.similarity, reverse=True)
    return matches[:5]
