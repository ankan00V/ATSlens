class RateLimitExceeded(Exception):
    def __init__(self, detail: str = "Rate limit exceeded"):
        self.detail = detail
        super().__init__(detail)
