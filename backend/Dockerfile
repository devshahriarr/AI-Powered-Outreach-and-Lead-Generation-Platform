# ==============================================================================
# Phase 1: Build and Compile Dependencies Stage
# ==============================================================================
FROM python:3.12-slim AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /build

# Copy the high-performance uv binary from the official image
COPY --from=ghcr.io/astral-sh/uv:0.1.45 /uv /uvx /bin/

# Copy dependencies definitions
COPY pyproject.toml .

# Build the virtual environment using uv for extreme speed and precision
RUN uv venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Compile and install packages
RUN uv pip install .

# ==============================================================================
# Phase 2: Secure Final Runtime Container Stage
# ==============================================================================
FROM python:3.12-slim AS runner

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Copy the compiled virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv

# Create an unprivileged non-root operating system user for secure isolation
RUN groupadd -g 10001 appgroup && \
    useradd -r -u 10001 -g appgroup -m -d /home/appuser -s /bin/bash appuser

# Copy backend files and change directory permissions to appuser
COPY --chown=appuser:appgroup . .

# Expose port
EXPOSE 8000

# Switch from root execution context to appuser for secure execution
USER appuser

# Run the uvicorn API dev server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
