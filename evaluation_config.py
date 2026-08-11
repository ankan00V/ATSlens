# evaluation_config.py
"""Internal configuration module for ATSLens evaluation rubrics.
Provides data structures and helper functions to load company‑specific rubrics
and a fallback rubric. Currently uses a simple JSON‑based lookup in the
`config/company_rubrics/` directory. If a rubric for the requested company is
not found, the fallback rubric is used.
"""

import json
from typing import List
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Tuple, Dict, Any

# Directory where company rubrics are stored (relative to project root)
COMPANY_RUBRICS_DIR = Path(__file__).parent / "config" / "company_rubrics"

@dataclass
class EvaluationWeights:
    """Weighting factors for composite scoring.

    * ``company`` – weight applied to the company‑specific rubric score.
    * ``fallback`` – weight applied to the fallback rubric score.
    """

    company: float = 0.7
    fallback: float = 0.3

# Default weighting (70% company, 30% fallback)
DEFAULT_WEIGHTS = EvaluationWeights()

def load_rubric_from_path(path: Path) -> Dict[str, Any]:
    """Load a rubric JSON file.

    Args:
        path: Path to the JSON file.
    Returns:
        Parsed JSON as a dictionary.
    """
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def compute_composite_rank(company_scores: List[Dict[str, Any]]) -> float:
    """Compute a composite rank from a list of company rubric scores.

    Each score dict is expected to contain ``score`` and ``max`` fields.
    The function normalises each score by its ``max`` (if ``max`` > 0),
    averages the normalised values and scales the result to a 0‑100 range.
    """
    if not company_scores:
        return 0.0
    normalized: List[float] = []
    for entry in company_scores:
        score = entry.get("score", 0)
        max_val = entry.get("max", 0)
        if max_val:
            normalized.append(min(max(score / max_val, 0.0), 1.0))
    if not normalized:
        return 0.0
    avg_norm = sum(normalized) / len(normalized)
    # Scale to 0‑100. Weighting factors could be applied here if needed.
    return avg_norm * 100.0

def get_company_rubric(company_name: str) -> Tuple[Dict[str, Any] | None, bool]:
    """Retrieve the rubric for *company_name*.

    Returns a tuple ``(rubric, used_fallback)`` where ``rubric`` is a ``dict``
    (or ``None`` if the file cannot be read) and ``used_fallback`` indicates
    whether the fallback rubric was used.
    """
    if not company_name:
        return None, True

    # Normalise the file name (lowercase, spaces -> underscores)
    filename = f"{company_name.lower().replace(' ', '_')}.json"
    candidate_path = COMPANY_RUBRICS_DIR / filename
    if candidate_path.is_file():
        try:
            return load_rubric_from_path(candidate_path), False
        except Exception:
            # If loading fails, fall back silently
            pass
    # Fallback: look for a generic fallback.json file
    fallback_path = COMPANY_RUBRICS_DIR / "fallback.json"
    if fallback_path.is_file():
        try:
            return load_rubric_from_path(fallback_path), True
        except Exception:
            pass
    # No rubric found at all
    return None, True

__all__ = [
    "compute_composite_rank",
    "EvaluationWeights",
    "DEFAULT_WEIGHTS",
    "get_company_rubric",
]
