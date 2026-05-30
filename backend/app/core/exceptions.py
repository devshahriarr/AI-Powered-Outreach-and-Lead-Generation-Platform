import logging
from typing import Any, Dict
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("app.exceptions")


# ==============================================================================
# Domain & Infrastructure Exception Classes
# ==============================================================================

class CateringAppException(Exception):
    """Base exception for all application errors."""
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class EntityNotFoundError(CateringAppException):
    """Raised when a database entity is not found."""
    def __init__(self, entity_name: str, identifier: Any):
        message = f"{entity_name} with identifier '{identifier}' not found."
        super().__init__(message, status_code=status.HTTP_404_NOT_FOUND)


class LeadGenServiceError(CateringAppException):
    """Raised when there's an error during the lead generation service operations."""
    def __init__(self, message: str):
        super().__init__(message, status_code=status.HTTP_502_BAD_GATEWAY)


class ConfigurationError(CateringAppException):
    """Raised when there's a missing or misconfigured credential or variable."""
    def __init__(self, message: str):
        super().__init__(message, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==============================================================================
# Global Exception Handlers for FastAPI
# ==============================================================================

async def catering_app_exception_handler(request: Request, exc: CateringAppException) -> JSONResponse:
    """Handles custom application exceptions."""
    logger.warning(
        f"Application warning: {exc.message} on path {request.url.path}",
        extra={"status_code": exc.status_code, "path": request.url.path}
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "error_code": exc.__class__.__name__}
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handles request validation errors (Pydantic parsing failures)."""
    errors = exc.errors()
    formatted_errors = []
    for err in errors:
        formatted_errors.append({
            "field": " -> ".join(str(loc) for loc in err["loc"] if loc != "body"),
            "message": err["msg"],
            "type": err["type"]
        })
        
    logger.info(
        f"Validation error on path {request.url.path}",
        extra={"errors": formatted_errors, "path": request.url.path}
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation failed for incoming payload.",
            "error_code": "ValidationError",
            "validation_errors": formatted_errors
        }
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handles standard HTTP exceptions (404, 405, etc. raised inside FastAPI)."""
    logger.warning(
        f"HTTP exception: {exc.detail} on path {request.url.path}",
        extra={"status_code": exc.status_code, "path": request.url.path}
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error_code": "HTTPException"}
    )


async def global_unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catches all unhandled server exceptions (500 Internal Errors)."""
    logger.exception(
        f"Unhandled exception encountered: {str(exc)} on path {request.url.path}",
        extra={"path": request.url.path}
    )
    # Never expose raw python tracebacks or error messages to the client in production!
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected internal server error occurred.",
            "error_code": "InternalServerError"
        }
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Registers exception handlers with the FastAPI application."""
    app.add_exception_handler(CateringAppException, catering_app_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(Exception, global_unhandled_exception_handler)
