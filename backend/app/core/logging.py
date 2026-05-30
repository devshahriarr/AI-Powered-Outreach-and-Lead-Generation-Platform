import json
import logging
import sys
from datetime import datetime, timezone
from app.core.config import settings


class StructuredFormatter(logging.Formatter):
    """
    Custom logging formatter that generates structured JSON logs
    for production and standard console output for local development.
    """

    def __init__(self, is_production: bool = False):
        super().__init__()
        self.is_production = is_production

    def format(self, record: logging.LogRecord) -> str:
        # Standard attributes
        log_data = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Include traceback details if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Include custom dynamic fields attached to extra
        if hasattr(record, "extra") and isinstance(record.extra, dict):
            for k, v in record.extra.items():
                if k not in log_data:
                    log_data[k] = v

        if self.is_production:
            return json.dumps(log_data)
        
        # Color codes for pretty development print
        colors = {
            "DEBUG": "\033[36m",    # Cyan
            "INFO": "\033[32m",     # Green
            "WARNING": "\033[33m",  # Yellow
            "ERROR": "\033[31m",    # Red
            "CRITICAL": "\033[41m", # Red background
        }
        reset = "\033[0m"
        color = colors.get(record.levelname, reset)

        # Dev-friendly output string
        timestamp_str = datetime.fromtimestamp(record.created).strftime("%Y-%m-%d %H:%M:%S")
        exc_str = f"\n{log_data['exception']}" if "exception" in log_data else ""
        return f"{color}[{record.levelname}]{reset} {timestamp_str} | {record.name}:{record.lineno} | {record.getMessage()}{exc_str}"


def setup_logging() -> logging.Logger:
    """
    Sets up the global application logger configuration.
    """
    logger = logging.getLogger()
    
    # Remove default handlers
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)

    # Output to stdout
    handler = logging.StreamHandler(sys.stdout)
    
    # Set production mode check
    is_prod = settings.APP_ENV in ("production", "staging")
    formatter = StructuredFormatter(is_production=is_prod)
    handler.setFormatter(formatter)
    
    logger.addHandler(handler)
    
    # Determine default log levels
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    logger.setLevel(log_level)

    # Reduce verbosity of third party libraries unless explicitly requested
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    return logger
