import logging
import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

logger = logging.getLogger("app.middleware.request")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that captures detailed performance metrics and logging metadata
    for every incoming HTTP request and outgoing HTTP response.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start_time = time.perf_counter()
        
        # Extract metadata
        client_host = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path
        query_params = str(request.query_params)
        
        # Log request receipt
        logger.info(
            f"Incoming request: {method} {path}",
            extra={
                "client_host": client_host,
                "method": method,
                "path": path,
                "query": query_params,
            }
        )

        try:
            response = await call_next(request)
            
            # Calculate duration in milliseconds
            duration_ms = (time.perf_counter() - start_time) * 1000.0
            
            # Log response delivery
            logger.info(
                f"Outgoing response: {method} {path} - {response.status_code} ({duration_ms:.2f}ms)",
                extra={
                    "method": method,
                    "path": path,
                    "status_code": response.status_code,
                    "duration_ms": round(duration_ms, 2),
                }
            )
            
            # Inject duration in response headers for performance tracking / client info
            response.headers["X-Response-Time-Ms"] = f"{duration_ms:.2f}"
            return response
            
        except Exception as exc:
            # Calculate duration up to exception
            duration_ms = (time.perf_counter() - start_time) * 1000.0
            logger.error(
                f"Exception raised processing {method} {path} - ({duration_ms:.2f}ms)",
                exc_info=True,
                extra={
                    "method": method,
                    "path": path,
                    "duration_ms": round(duration_ms, 2),
                }
            )
            # Re-raise to let the global unhandled exception handler map this to standard JSON response
            raise exc
