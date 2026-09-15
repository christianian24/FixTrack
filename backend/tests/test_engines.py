"""Tests for the duplicate detection and priority advisor engines."""
from __future__ import annotations

import pytest

from app.services.priority_engine import compute_priority, PriorityLevel
from app.services.duplicate_engine import _jaccard, _tokenize, JACCARD_THRESHOLD as SIMILARITY_THRESHOLD


def token_jaccard_similarity(a: str, b: str) -> float:
    """Helper that wraps the engine's internal tokenize + jaccard."""
    return _jaccard(_tokenize(a), _tokenize(b))


class TestPriorityEngine:
    def test_safety_hazard_critical(self):
        result = compute_priority(
            safety_risk=True,
            affected_users=200,
            category_priority_hint="HIGH",
            open_duplicate_count=0,
        )
        assert result.level == PriorityLevel.CRITICAL

    def test_large_population_high(self):
        result = compute_priority(
            safety_risk=False,
            affected_users=150,
            category_priority_hint="MEDIUM",
            open_duplicate_count=0,
        )
        assert result.level in (PriorityLevel.HIGH, PriorityLevel.CRITICAL)

    def test_low_impact_low(self):
        result = compute_priority(
            safety_risk=False,
            affected_users=2,
            category_priority_hint="LOW",
            open_duplicate_count=0,
        )
        assert result.level in (PriorityLevel.LOW, PriorityLevel.MEDIUM)

    def test_duplicate_boost(self):
        """Multiple duplicate reports should raise priority."""
        no_dupes = compute_priority(
            safety_risk=False,
            affected_users=5,
            category_priority_hint="LOW",
            open_duplicate_count=0,
        )
        with_dupes = compute_priority(
            safety_risk=False,
            affected_users=5,
            category_priority_hint="LOW",
            open_duplicate_count=5,
        )
        assert with_dupes.score >= no_dupes.score

    def test_critical_category_hint(self):
        result = compute_priority(
            safety_risk=False,
            affected_users=1,
            category_priority_hint="CRITICAL",
            open_duplicate_count=0,
        )
        assert result.level in (PriorityLevel.HIGH, PriorityLevel.CRITICAL)

    def test_score_bounded(self):
        result = compute_priority(
            safety_risk=True,
            affected_users=999,
            category_priority_hint="CRITICAL",
            open_duplicate_count=10,
        )
        assert 0 <= result.score <= 100


class TestDuplicateEngine:
    def test_identical_titles_are_similar(self):
        sim = token_jaccard_similarity(
            "Broken light in Room 101",
            "Broken light in Room 101",
        )
        assert sim == 1.0

    def test_completely_different_titles(self):
        sim = token_jaccard_similarity(
            "leaking faucet restroom",
            "broken projector screen",
        )
        assert sim < SIMILARITY_THRESHOLD

    def test_similar_titles_detected(self):
        sim = token_jaccard_similarity(
            "flickering fluorescent light Room 101",
            "flickering light fixture room 101",
        )
        assert sim >= SIMILARITY_THRESHOLD

    def test_empty_strings(self):
        ta = _tokenize("")
        tb = _tokenize("")
        sim = _jaccard(ta, tb)
        assert sim == 0.0

    def test_case_insensitive(self):
        sim1 = token_jaccard_similarity("BROKEN LIGHT fixture", "broken light fixture")
        assert sim1 == 1.0
