import time
from functools import wraps
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

def _rate_limit_exceeded_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": f"Rate limit exceeded: {str(exc)}"}
    )

class Limiter:
    def __init__(self, key_func=get_remote_address, default_limits=None):
        self.key_func = key_func
        self.history = {}

    def limit(self, limit_spec: str):
        parts = limit_spec.split("/")
        max_requests = int(parts[0])
        unit = parts[1].lower() if len(parts) > 1 else "minute"
        if "min" in unit:
            window_seconds = 60
        elif "hour" in unit:
            window_seconds = 3600
        elif "sec" in unit:
            window_seconds = 1
        elif "day" in unit:
            window_seconds = 86400
        else:
            window_seconds = 60

        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                request = kwargs.get("request")
                if not request:
                    for arg in args:
                        if hasattr(arg, "client") and hasattr(arg, "headers"):
                            request = arg
                            break

                key = self.key_func(request) if request else "global"
                now = time.time()
                timestamps = self.history.get(key, [])
                valid_timestamps = [t for t in timestamps if now - t < window_seconds]
                if len(valid_timestamps) >= max_requests:
                    raise RateLimitExceeded(f"{max_requests} per {unit}")
                valid_timestamps.append(now)
                self.history[key] = valid_timestamps

                return await func(*args, **kwargs)
            return wrapper
        return decorator
