# AI-Powered Catering Lead Generation & Outreach Backend (Phase 1)

This project initializes the backend architecture for the **Catering Lead Generation & Outreach Agent (Agent 2)**. The platform is designed to find nearby businesses, assess lead properties, generate personalized outreach materials using AI, send automated outreach campaigns, and manage standard lead pipeline workflows.

This codebase conforms to strictly defined enterprise engineering patterns:
- **SOLID Clean Architecture**: Strong boundaries between the API routing layer, business service logic layer, and database repositories.
- **Async Database Connection Pooling**: Multi-client high-performance PostgreSQL driver via SQLAlchemy 2.0 and `asyncpg`.
- **Centralized Structured Logging**: Clean, readable human outputs in development, and structured JSON telemetry logs in production.
- **Fail-Safe Security**: Strict inputs schema validation, robust unhandled exception shields (preventing raw traceback leakage), and dynamic latency audits.

---

## Technical Stack
- **Python**: 3.12+
- **API Engine**: FastAPI
- **Database**: PostgreSQL 16
- **ORM / Engine**: SQLAlchemy 2.0 + asyncpg
- **Migrations**: Alembic
- **Validation**: Pydantic v2 & Pydantic Settings v2
- **Containerization**: Docker + Docker Compose
- **Packaging**: uv package manager (recommended) or standard Pip/Pipenv
- **Testing**: pytest + pytest-asyncio + httpx AsyncClient

---

## File Architecture Directory Structure

```
catering-outreach/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   └── health.py    # System health ping check
│   │   │   │   └── router.py        # Central routes index
│   │   │   └── deps.py
│   │   ├── core/
│   │   │   ├── config.py            # Central settings & default variables
│   │   │   ├── logging.py           # Structured logs configuration
│   │   │   ├── exceptions.py        # Central validation & unhandled shields
│   │   │   └── security.py
│   │   ├── db/
│   │   │   ├── session.py           # Async engine creation & DB dependency
│   │   │   └── base.py
│   │   ├── models/
│   │   │   └── base.py              # DeclarativeBase, snake_case & audit times
│   │   ├── schemas/
│   │   │   └── health.py            # Serialization schema for health check
│   │   ├── services/
│   │   │   └── base_service.py      # Base class representing transaction limits
│   │   ├── repositories/
│   │   │   └── base_repository.py   # Generic CRUD abstraction for isolation
│   │   ├── middlewares/
│   │   │   └── logging.py           # Custom latency monitoring middleware
│   │   └── main.py                  # Startup/lifespan context & FastAPI setup
│   │
│   ├── tests/
│   │   ├── conftest.py              # Pytest setup and async mock engines
│   │   └── test_health.py           # Core integration checks
│   ├── alembic/                     # Migrations storage directory
│   ├── docker/
│   │   └── postgres/
│   │       └── init.sql             # SQL bootstrap template
│   ├── .env.example                 # Global settings variables template
│   ├── .env                         # Active loaded variables
│   ├── Dockerfile                   # Multi-stage security container builder
│   ├── pyproject.toml               # Unified metadata and tool definitions
│   └── alembic.ini                  # Alembic CLI settings
│
└── docker-compose.yml               # Complete orchestration builder file
```

---

## Local Setup Instructions

Ensure you have **Python 3.12+** installed. We strongly recommend using `uv` for lightning-fast setup.

### 1. Configure the Environment
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Replicate the template environment variables:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and verify the settings.

### 2. Set Up Virtual Environment & Dependencies

#### Using the `uv` Package Manager (Recommended)
1. Initialize the virtual environment:
   ```bash
   uv venv
   ```
2. Activate the virtual environment:
   - **Windows PowerShell**:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS / Git Bash**:
     ```bash
     source .venv/bin/activate
     ```
3. Sync and install all packages (including development packages):
   ```bash
   uv pip install -e .[dev]
   ```

#### Using standard `pip`
1. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```
2. Activate the virtual environment:
   - **Windows PowerShell**:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
3. Install dependencies:
   ```bash
   pip install -e .
   pip install pytest pytest-asyncio black ruff
   ```

### 3. Launch Development Server
With the environment activated, boot the API:
```bash
uvicorn app.main:app --reload --port 8000
```
- Open Swagger UI docs at: [http://localhost:8000/docs](http://localhost:8000/docs)
- Verify health status: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 4. Running the Test Suite
Ensure the virtual environment is active, then execute:
```bash
pytest
```
*Note: Pytest triggers mock DB overrides, running 100% offline at extreme speeds without needing actual PostgreSQL database servers running.*

---

## Docker Compose Setup (Single Command Boot)

To compile code and boot PostgreSQL alongside FastAPI automatically:

1. Navigate to the project root containing `docker-compose.yml`:
   ```bash
   cd C:\Users\shahiar betopia\.gemini\antigravity\scratch\catering-outreach
   ```
2. Spin up containers in the background:
   ```bash
   docker compose up --build -d
   ```
   *This command:*
   - Downloads PostgreSQL 16 Alpine and boots it.
   - Triggers the custom health check until database port 5432 is healthy.
   - Compiles the FastAPI backend Docker image.
   - Mounts the local code directory to the container so edits reload automatically.
   - Exposes ports: Database on `5432` and API on `8000`.

3. Watch the logs:
   ```bash
   docker compose logs -f
   ```
4. Stop the context:
   ```bash
   docker compose down
   ```

### Running Tests inside Docker Container
To execute the test suite in the running Docker context:
```bash
docker compose exec backend pytest
```

---

## Database Migrations (Alembic)

Once database models are defined in `app/models/`, use Alembic to safely generate and apply tables.

1. **Initialize the First Migration Script**:
   ```bash
   # From the 'backend' folder
   alembic revision --autogenerate -m "Initial schema setup"
   ```
2. **Apply Migrations to the Database**:
   ```bash
   alembic upgrade head
   ```
