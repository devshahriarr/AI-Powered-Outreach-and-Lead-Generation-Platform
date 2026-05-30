# AI-Powered Catering Lead Generation & Outreach Agent (Catering-Outreach)

Welcome to the AI-Powered Outreach and Lead Generation Platform codebase.

Right now, we are starting with **Agent 2 — Catering Lead Generation & Outreach Agent**, designed to find nearby businesses using the Google Places API, store lead records in PostgreSQL, generate highly personalized, custom AI-powered email outreach templates, dispatch email campaigns, and monitor responses through a dynamic pipeline.

## Phase 1 — Backend Project Setup
The foundation of this project is fully containerized, tested, and structurally set up inside the **`backend/`** directory.

To get started, configure the environment and run the services:

- Detailed Setup Guide: [backend/README.md](file:///C:/Users/shahiar%20betopia/.gemini/antigravity/scratch/catering-outreach/backend/README.md)
- Root Orchestration file: [docker-compose.yml](file:///C:/Users/shahiar%20betopia/.gemini/antigravity/scratch/catering-outreach/docker-compose.yml)

### Direct Run Commands:
```bash
# Clone/Open this folder in your IDE/active workspace
# Run the platform using Docker Compose
docker compose up --build -d

# Execute tests locally in the active container
docker compose exec backend pytest
```
