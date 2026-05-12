"""Application-specific exceptions (mapped to HTTP in API routes)."""


class NutritionAnalysisError(Exception):
    """Raised when structured Gemini output is missing or invalid.

    Typically indicates schema drift or API regression upstream.
    """

    def __init__(self, message: str = "Structured analysis payload was empty.") -> None:
        super().__init__(message)


class ConfigurationError(Exception):
    """Raised when mandatory environment configuration is missing or unusable."""
