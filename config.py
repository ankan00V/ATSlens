"""Loads providers.json and exposes provider/model resolution."""

import json
import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env before any os.getenv below, so values apply regardless of import order.
load_dotenv(Path(__file__).parent / ".env")


def _env_flag(name: str, default: bool) -> bool:
    """Read a boolean env var, falling back to *default* when unset."""
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in ("1", "true", "yes", "on")


# Env vars each hosting platform injects into the running app, used only to tell
# "deployed" from "someone's laptop". Vercel sets VERCEL=1; Render sets RENDER=true.
_HOSTED = any(os.getenv(v) for v in ("VERCEL", "RENDER"))

# Global development mode flag. Preserved here because score.py and github.py
# import it from this module. It gates every write to disk (the resume/GitHub
# JSON cache under cache/ and the per-role CSV export). On Vercel those writes
# raise "Read-only file system" and kill the request; on Render they succeed but
# quietly accumulate junk on an ephemeral disk. Neither is wanted, so it defaults
# off wherever we are hosted, and stays on locally. Override with DEVELOPMENT_MODE.
DEVELOPMENT_MODE = _env_flag("DEVELOPMENT_MODE", default=not _HOSTED)

_CONFIG_PATH = Path(__file__).parent / "providers.json"

with open(_CONFIG_PATH) as _f:
    _config = json.load(_f)

# Default model, overridable by env.
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", _config["default_model"])

# Flat model -> {temperature, top_p} map. Preserves the contract that
# prompt.MODEL_PARAMETERS exposed to evaluator.py / pdf.py / github.py / score.py.
MODEL_PARAMETERS = {
    model: {k: v for k, v in params.items() if k in ("temperature", "top_p")}
    for provider in _config["providers"].values()
    for model, params in provider["models"].items()
}


def provider_for(model_name: str) -> dict:
    """Resolve provider config for a model.

    Returns {base_url, api_key, structured_output, extra_body}.
    Raises ValueError if the model is unknown or its required key is unset.
    """
    for name, prov in _config["providers"].items():
        if model_name not in prov["models"]:
            continue
        api_key_env = prov.get("api_key_env")
        api_key = os.getenv(api_key_env) if api_key_env else None
        if api_key_env and not api_key:
            raise ValueError(
                f"Model '{model_name}' uses provider '{name}', which requires "
                f"env var '{api_key_env}', but it is unset."
            )
        extra_body = {
            **prov.get("extra_body", {}),
            **prov["models"][model_name].get("extra_body", {}),
        }
        return {
            "base_url": prov["base_url"].rstrip("/"),
            "api_key": api_key,
            "structured_output": prov.get("structured_output", "json_schema"),
            "extra_body": extra_body,
        }

    available = ", ".join(sorted(MODEL_PARAMETERS))
    raise ValueError(
        f"Unknown model '{model_name}'. Available models: {available}"
    )
