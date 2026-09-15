"""
Server-side priority engine.

Mirrors the frontend priorityEngine.ts logic but runs authoritatively
on the server so clients cannot manipulate priority scores.

Score breakdown (0–100):
  - Safety hazard:         +40
  - Affects many (>50):    +20
  - Affects some (10-50):  +10
  - Category hint weight:  up to +25  (CRITICAL→25, HIGH→15, MEDIUM→8, LOW→3)
  - Duplicate reports:     +5 per duplicate, max +15
"""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class PriorityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


@dataclass
class PriorityResult:
    score: float
    level: PriorityLevel
    reasoning: str


# ─── Category hint → weight mapping ──────────────────────────────────────────

_HINT_WEIGHT: dict[str, float] = {
    "CRITICAL": 40.0,
    "HIGH": 25.0,
    "MEDIUM": 15.0,
    "LOW": 5.0,
}


def _score_to_level(score: float) -> PriorityLevel:
    if score >= 65:
        return PriorityLevel.CRITICAL
    elif score >= 40:
        return PriorityLevel.HIGH
    elif score >= 20:
        return PriorityLevel.MEDIUM
    return PriorityLevel.LOW


def compute_priority(
    safety_risk: bool,
    affected_users: int,
    category_priority_hint: str = "MEDIUM",
    open_duplicate_count: int = 0,
) -> PriorityResult:
    """
    Compute a 0-100 priority score and map it to a PriorityLevel.

    Parameters
    ----------
    safety_risk : bool
        Whether the concern poses an immediate physical safety hazard.
    affected_users : int
        Estimated number of people impacted.
    category_priority_hint : str
        The default priority hint for the facility category (LOW/MEDIUM/HIGH/CRITICAL).
    open_duplicate_count : int
        Number of other open concerns with similar title in the same location.
    """
    score = 0.0
    reasons: list[str] = []

    if safety_risk:
        score += 50
        reasons.append("Safety hazard (+50)")

    if affected_users > 100:
        score += 35
        reasons.append(f"Campus-wide / large impact ({affected_users}) (+35)")
    elif affected_users > 30:
        score += 25
        reasons.append(f"Affects many people ({affected_users}) (+25)")
    elif affected_users > 5:
        score += 15
        reasons.append(f"Affects {affected_users} people (+15)")

    hint = (category_priority_hint or "MEDIUM").upper()
    category_pts = _HINT_WEIGHT.get(hint, 15.0)
    score += category_pts
    reasons.append(f"Category hint {hint} (+{category_pts})")

    if open_duplicate_count > 0:
        dup_pts = min(open_duplicate_count * 5, 20)
        score += dup_pts
        reasons.append(f"{open_duplicate_count} duplicate report(s) (+{dup_pts})")

    score = round(min(score, 100.0), 2)
    level = _score_to_level(score)

    return PriorityResult(
        score=score,
        level=level,
        reasoning="; ".join(reasons),
    )


# ─── Legacy convenience wrapper (used by API endpoints) ──────────────────────

def recommend_priority(
    is_safety_hazard: bool,
    affects_many_people: bool,
    is_recurring: bool,
    category_weight: int = 5,
) -> tuple[str, float]:
    """
    Legacy wrapper — returns (priority_label, score).
    Kept for backwards compatibility with concern endpoints.
    """
    affected = 100 if affects_many_people else 1
    hint_map = {
        1: "LOW", 2: "LOW", 3: "LOW", 4: "MEDIUM", 5: "MEDIUM",
        6: "MEDIUM", 7: "HIGH", 8: "HIGH", 9: "CRITICAL", 10: "CRITICAL",
    }
    hint = hint_map.get(min(max(category_weight, 1), 10), "MEDIUM")
    result = compute_priority(
        safety_risk=is_safety_hazard,
        affected_users=affected,
        category_priority_hint=hint,
        open_duplicate_count=3 if is_recurring else 0,
    )
    return result.level.value, result.score
