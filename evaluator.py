from typing import Dict, List, Optional, Tuple, Any
from pydantic import BaseModel, Field, field_validator
from models import JSONResume
from llm_utils import initialize_llm_provider, extract_json_from_response
import logging
import json
import re

from prompt import (
    DEFAULT_MODEL,
    MODEL_PARAMETERS,
)
from prompts.template_manager import TemplateManager

logger = logging.getLogger(__name__)


class ResumeEvaluator:
    def __init__(
        self,
        role,
        evaluation_model,
        model_name: str = DEFAULT_MODEL,
        model_params: dict = None,
    ):
        if not model_name:
            raise ValueError("Model name cannot be empty")

        self.role = role
        self.evaluation_model = evaluation_model
        self.model_name = model_name
        self.model_params = model_params or MODEL_PARAMETERS.get(
            model_name, {"temperature": 0.5, "top_p": 0.9}
        )
        self.template_manager = TemplateManager()
        self._initialize_llm_provider()

    def _initialize_llm_provider(self):
        """Initialize the appropriate LLM provider based on the model."""
        self.provider = initialize_llm_provider(self.model_name)

    def _load_evaluation_prompt(self, resume_text: str, yoe: str = None, jd: str = None) -> str:
        return self.template_manager.render_string(
            self.role.criteria_source, text_content=resume_text, yoe=yoe, jd=jd
        )

    def evaluate_resume(self, resume_text: str, yoe: str = None, jd: str = None) -> BaseModel:
        self._last_resume_text = resume_text
        full_prompt = self._load_evaluation_prompt(resume_text, yoe, jd)
        # logger.info(f"🔤 Evaluation prompt being sent: {full_prompt}")
        try:
            system_message = self.template_manager.render_string(
                self.role.system_message_source, yoe=yoe, jd=jd
            )

            # Prepare chat parameters
            chat_params = {
                "model": self.model_name,
                "messages": [
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": full_prompt},
                ],
                "options": {
                    "stream": False,
                    "temperature": self.model_params.get("temperature", 0.5),
                    "top_p": self.model_params.get("top_p", 0.9),
                },
            }

            # Add format parameter for structured output
            kwargs = {"format": self.evaluation_model.model_json_schema()}
            # Use the appropriate provider to make the API call
            response = self.provider.chat(**chat_params, **kwargs)

            response_text = response["message"]["content"]
            response_text = extract_json_from_response(response_text)
            logger.error(f"🔤 Prompt response: {response_text}")

            evaluation_dict = json.loads(response_text)

            # Ensure sub_scores, keyword_gap_analysis, missing_tech_stack, and skill_recommendations are populated
            scores_dict = evaluation_dict.get("scores", {}) if isinstance(evaluation_dict.get("scores"), dict) else {}
            sub_scores = evaluation_dict.get("sub_scores", {}) if isinstance(evaluation_dict.get("sub_scores"), dict) else {}

            def _resolve_sub_score(key: str) -> float:
                if key in sub_scores and isinstance(sub_scores[key], (int, float)):
                    return float(sub_scores[key])
                if key in scores_dict and isinstance(scores_dict[key], dict):
                    return float(scores_dict[key].get("score", 0.0))
                return 0.0

            evaluation_dict["sub_scores"] = {
                "work_experience": _resolve_sub_score("work_experience"),
                "technical_skills": _resolve_sub_score("technical_skills"),
                "education": _resolve_sub_score("education"),
                "project_impact": _resolve_sub_score("project_impact"),
            }

            kg = evaluation_dict.get("keyword_gap_analysis", {}) if isinstance(evaluation_dict.get("keyword_gap_analysis"), dict) else {}
            matched_kw = kg.get("matched_keywords", [])
            missing_kw = kg.get("missing_keywords", [])
            evaluation_dict["keyword_gap_analysis"] = {
                "matched_keywords": matched_kw if isinstance(matched_kw, list) else [],
                "missing_keywords": missing_kw if isinstance(missing_kw, list) else [],
            }

            missing_ts = evaluation_dict.get("missing_tech_stack")
            if not isinstance(missing_ts, list) or not missing_ts:
                missing_ts = list(evaluation_dict["keyword_gap_analysis"]["missing_keywords"])
            evaluation_dict["missing_tech_stack"] = missing_ts

            sr = evaluation_dict.get("skill_recommendations")
            if not isinstance(sr, list) or not sr:
                sr = [f"Enhance skill level in {kw}" for kw in evaluation_dict["missing_tech_stack"]]
                if not sr and evaluation_dict.get("areas_for_improvement"):
                    sr = list(evaluation_dict.get("areas_for_improvement", []))
            evaluation_dict["skill_recommendations"] = sr

            evaluation_data = self.evaluation_model(**evaluation_dict)

            return evaluation_data

        except Exception as e:
            logger.error(f"Error evaluating resume: {str(e)}")
            raise

