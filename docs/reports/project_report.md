# 🏗️ AI-Powered Catering Outreach Platform — Full Project Report

> **Generated:** 2026-06-04  
> **Scope:** Full-stack analysis — Backend (FastAPI), Frontend (Next.js), Database (PostgreSQL), Testing, Architecture, Patterns, Workflows

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Backend: Modules & Sub-Modules](#3-backend-modules--sub-modules)
4. [Frontend: Modules & Sub-Modules](#4-frontend-modules--sub-modules)
5. [Database Design](#5-database-design)
6. [API Contract (All Endpoints)](#6-api-contract-all-endpoints)
7. [Backend Request–Response Lifecycle](#7-backend-requestresponse-lifecycle)
8. [Frontend Request–Response Lifecycle](#8-frontend-requestresponse-lifecycle)
9. [Agent Automated Workflow](#9-agent-automated-workflow)
10. [System's User Workflow](#10-systems-user-workflow)
11. [Software Patterns Used](#11-software-patterns-used)
12. [Design Principles Maintained](#12-design-principles-maintained)
13. [Testing Coverage](#13-testing-coverage)
14. [What Is Done vs. Pending](#14-what-is-done-vs-pending)
15. [Inconsistencies & Mismatches](#15-inconsistencies--mismatches)
16. [Redundancies](#16-redundancies)
17. [Concerns & Observations](#17-concerns--observations)
18. [Suggestions & Recommendations](#18-suggestions--recommendations)

---

## 1. Project Overview

**Platform Name:** Catering Outreach Platform (AI Outreach Command Center)  
**Purpose:** An AI-powered B2B lead generation and outreach automation system for a catering business targeting corporate clients. It discovers local businesses via Apify/Google Maps scraping, qualifies them via scoring, generates personalized cold-outreach emails with OpenAI GPT-4o, and provides a review+approval workflow for human oversight before sending.

**Primary Users:** Catering business administrators (internal ops team)  
**Target Market:** Corporate offices, law firms, schools, insurance offices, production studios in Dhaka, Bangladesh (configurable)

**Planned Delivery Phases:**
| Phase | Description | Status |
|---|---|---|
| Phase 1 | Layout System & Design Foundation | ✅ Done |
| Phase 1.5 | Layout Refinements | ✅ Done |
| Phase 2 | Lead Operations Center | ✅ Done |
| Phase 3 | Campaign Management Center | ✅ Done |
| Phase 4 | Outreach Message Review & Approval | ✅ Done |
| Phase 5 | Analytics, Pipeline Board, Email Sending | ❌ Pending |

---

## 2. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│           Next.js 16 (App Router, Turbopack)                     │
│           Port: 3000                                             │
└──────────────────────────────┬───────────────────────────────────┘
                               │  /api/v1/* (rewrite proxy)
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                  FastAPI Backend (Python 3.12)                    │
│           Uvicorn ASGI Server — Port: 8000                       │
│                                                                  │
│  Middleware Stack:                                               │
│  ① RequestLoggingMiddleware (latency auditing)                   │
│  ② CORSMiddleware (allow all origins — dev mode)                 │
│  ③ Exception Handlers (structured error responses)               │
│                                                                  │
│  API Router → /api/v1/{endpoint}                                 │
└──────────────────────────────┬───────────────────────────────────┘
                               │  asyncpg (async driver)
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│             PostgreSQL 16 (Docker or local)                      │
│             Database: catering_outreach                          │
│             Port: 5432                                           │
└──────────────────────────────────────────────────────────────────┘

External Dependencies:
  ┌─────────────────┐    ┌─────────────────┐    ┌───────────────┐
  │  Apify API      │    │  OpenAI API      │    │  SendGrid     │
  │ (Google Maps    │    │ (GPT-4o email   │    │ (Not yet      │
  │  Scraper Actor) │    │  generation)    │    │  integrated)  │
  └─────────────────┘    └─────────────────┘    └───────────────┘
```

**Key Architectural Decision:** Next.js rewrites all `/api/v1/*` requests to `http://localhost:8000/api/v1/*`, which means the frontend never makes direct cross-origin calls — CORS issues are avoided entirely in the browser.

---

## 3. Backend: Modules & Sub-Modules

### 3.1 `app/main.py` — Application Bootstrap
- Initializes FastAPI with `lifespan` context manager for DB pool cleanup
- Mounts 3-layer middleware (logging → CORS → exception handlers)
- Registers the central `api_router`
- Exposes `/docs` (Swagger UI) and `/redoc`

### 3.2 `app/core/` — Core Infrastructure
| File | Responsibility |
|---|---|
| `config.py` | Pydantic-settings class; reads all env vars (DB URL, API keys, defaults) |
| `exceptions.py` | Custom exception hierarchy (`EntityNotFoundError`, `CateringAppException`, `ConfigurationError`) |
| `logging.py` | Structured logging setup |

### 3.3 `app/models/` — SQLAlchemy ORM Models

| Model | Table | Key Fields |
|---|---|---|
| `Base` | — | `id` (PK), `created_at`, `updated_at` (auto timezone-aware) |
| `Lead` | `lead` | `google_place_id` (unique), `name`, `status` (DISCOVERED→QUALIFIED→…), `lead_score`, `is_qualified`, `review_status` |
| `Campaign` | `campaign` | `name`, `campaign_type`, `target_business_type`, `offer`, `status` |
| `CampaignSettings` | `campaign_settings` | FK → `campaign.id`, `restaurant_name`, `sender_name`, `reply_email`, `brand_voice` |
| `LeadOutreachMessage` | `lead_outreach_message` | FK → `lead.id` + `campaign.id`, `subject`, `body`, `cta`, `status`, `model_name` |
| `PlatformSettings` | `platform_settings` | Singleton: `restaurant_name`, `sender_name`, `offer`, `call_to_action`, `brand_voice` |

### 3.4 `app/models/enums.py` — Domain Enumerations

| Enum | Values |
|---|---|
| `LeadStatus` | DISCOVERED, QUALIFIED, REVIEW_REQUIRED, CONTACTED, INTERESTED, MEETING_REQUESTED, BOOKED, CLOSED_WON, CLOSED_LOST, REJECTED |
| `CampaignStatus` | draft, active, paused, completed, archived |
| `MessageStatus` | draft, generated, edited, approved, sent, failed, replied |

### 3.5 `app/repositories/` — Data Access Layer (DAL)

| Repository | Extends | Extra Methods |
|---|---|---|
| `BaseRepository` | — | `get`, `get_multi`, `create`, `update`, `remove` |
| `LeadRepository` | `BaseRepository[Lead]` | `get_by_google_place_id`, `get_by_status`, `get_by_business_type`, `get_unprocessed_leads` |
| `CampaignRepository` | `BaseRepository[Campaign]` | `get_by_status`, `get_by_name` |
| `OutreachMessageRepository` | `BaseRepository[LeadOutreachMessage]` | `get_filtered` (status/lead/campaign filters) |
| `PlatformSettingsRepository` | `BaseRepository[PlatformSettings]` | `get_singleton` |

### 3.6 `app/services/` — Business Logic Layer

| Service | Responsibility |
|---|---|
| `LeadService` | Orchestrates Apify/Google search → dedup → email resolution → DB commit pipeline |
| `LeadCleanupService` | Normalizes emails/websites/phones, applies rejection rules (bad names, personal email domains) |
| `LeadQualificationService` | Scores leads (0–100) → routes to QUALIFIED/REVIEW_REQUIRED/REJECTED |
| `ApifyPlacesService` | Wraps Apify REST API actor runs, normalizes response to Google Places shape, maintains in-memory detail cache |
| `GooglePlacesService` | Alternative provider for Google Maps API (pluggable swap) |
| `CampaignService` | Campaign CRUD, status filtering |
| `EmailGenerationService` | Calls OpenAI GPT-4o with structured outputs (`GeneratedEmailContent`), builds system + user prompts from `PlatformSettings` |
| `PlatformSettingsService` | Singleton upsert/get for global restaurant configuration |

### 3.7 `app/schemas/` — Pydantic V2 Schemas (DTOs)
- `lead.py`: `LeadDiscoverRequest`, `LeadResponse`, `LeadUpdate`, `LeadQualifyResponse`
- `campaign.py`: `CampaignCreate`, `CampaignResponse`, `CampaignUpdate`
- `outreach_message.py`: `GenerateEmailRequest`, `GeneratedEmailContent`, `OutreachMessageUpdate`, `OutreachMessageResponse`, `ApproveMessageRequest`, `RejectMessageRequest`
- `platform_settings.py`: `PlatformSettingsCreate`, `PlatformSettingsUpdate`, `PlatformSettingsResponse`

### 3.8 `app/api/v1/endpoints/` — Route Handlers

| File | Routes | Methods |
|---|---|---|
| `health.py` | `/health` | GET |
| `leads.py` | `/leads`, `/leads/discover`, `/leads/qualify`, `/leads/qualified`, `/leads/rejected`, `/leads/review`, `/leads/{id}` | GET, POST, PATCH, DELETE |
| `campaigns.py` | `/campaigns`, `/campaigns/{id}` | GET, POST, PATCH, DELETE |
| `campaign_settings.py` | `/campaign-settings` | GET, PATCH (upsert) |
| `outreach_messages.py` | `/outreach-messages`, `/outreach-messages/{id}`, `/outreach-messages/{id}/approve`, `/outreach-messages/{id}/regenerate`, `/leads/{id}/generate-email` | GET, POST, PATCH |
| `stats.py` | `/stats` | GET |

### 3.9 `app/middlewares/`
- `RequestLoggingMiddleware`: Logs method, path, and response latency (ms) for every request using Python's async middleware interface

### 3.10 `app/db/`
- `session.py`: Creates async SQLAlchemy engine + `AsyncSession` factory with `get_db_session` dependency
- Uses `asyncpg` as the async PostgreSQL driver

---

## 4. Frontend: Modules & Sub-Modules

### 4.1 Tech Stack
| Item | Choice |
|---|---|
| Framework | Next.js 16.2.7 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Vanilla CSS (globals.css, CSS custom properties) |
| Data Fetching | TanStack Query (React Query) v5 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Toast | Custom `ToastProvider` |
| HTTP | Custom `fetch` wrapper (`src/lib/api.ts`) |

### 4.2 Route Map

| Route | Page | Data Source | Status |
|---|---|---|---|
| `/` | Redirect → `/dashboard` | — | ✅ |
| `/dashboard` | Command Center overview | **Mock data only** | ⚠️ |
| `/leads` | Lead list (all statuses) | API: `/leads` | ✅ |
| `/leads/qualified` | Qualified leads + bulk assign | API: `/leads/qualified` | ✅ |
| `/leads/review` | Review-required leads | API: `/leads/review` | ✅ |
| `/leads/rejected` | Rejected leads | API: `/leads/rejected` | ✅ |
| `/campaigns` | Campaign list table | API: `/campaigns` | ✅ |
| `/campaigns/new` | Campaign create form | API: POST `/campaigns` | ✅ |
| `/campaigns/[id]` | Campaign command center | API: `/campaigns/{id}` | ✅ |
| `/campaigns/[id]/edit` | Edit campaign | API: PATCH `/campaigns/{id}` | ✅ |
| `/outreach` | Outreach review & approval | API: `/outreach-messages` | ✅ |
| `/analytics` | Analytics charts | **Empty state placeholder** | ❌ |
| `/pipeline` | Sales pipeline board | **Empty state placeholder** | ❌ |
| `/settings` | Brand/sender settings | **Empty state placeholder** | ❌ |

### 4.3 Component Library

**Shared Components** (`src/components/shared/`)
- `PageHeader.tsx` — Consistent page title + breadcrumb + action slot
- `KpiCard.tsx` — Metric card with trend indicator and icon
- `SectionCard.tsx` — Content container with title/description/actions
- `StatusBadge.tsx` — Generic pill badge (used in dashboard for agent status)
- `EmptyState.tsx` — Illustrated empty state with action button
- `DataTable.tsx` — Generic sortable + paginated table wrapper
- `ConfirmDialog.tsx` — Reusable confirmation modal
- `Pagination.tsx` — Page navigation controls

**Campaign Components** (`src/components/campaigns/`)
- `CampaignStatusBadge.tsx` — Color-coded status pill (draft/active/paused/etc.)
- `CampaignStatsCards.tsx` — Dashboard stat row for campaigns
- `CampaignTable.tsx` — Full table with search/sort/pagination
- `CampaignForm.tsx` — React Hook Form create/edit
- `CampaignHeader.tsx` — Campaign detail page header with actions
- `CampaignSettingsForm.tsx` — Platform-wide settings form (maps to `PlatformSettings`)
- `AssignCampaignModal.tsx` — Bulk lead → campaign assignment popup

**Lead Components** (`src/components/leads/`)
- `LeadTable.tsx` — Full-featured lead table with status badges and inline editing
- `LeadStatusBadge.tsx` — QUALIFIED/REJECTED/etc. badge
- (Lead filters, sorting, pagination)

**Outreach Components** (`src/components/outreach/`)
- `OutreachStatusBadge.tsx` — generated/approved/sent/failed/etc. badge
- `OutreachMetricsCards.tsx` — Top metrics strip (total, approved, sent, reply rate)
- `OutreachMessageTable.tsx` — Left split-pane message list with checkboxes
- `OutreachMessageEditor.tsx` — Inline subject/body/CTA edit form
- `OutreachMessagePreview.tsx` — Right split-pane full preview + actions
- `AiInsightsCard.tsx` — Sidebar panel showing readability/spam/personalization scores

**Navigation** (`src/components/navigation/`)
- `Sidebar.tsx` — Collapsible navigation with route links and active state indicators

**Layout** (`src/components/layout/`)
- `AppLayout.tsx` — Root shell: Sidebar + main content area

### 4.4 Service Layer (`src/services/`)

| File | Backend Endpoint Group |
|---|---|
| `leads.ts` | `/leads/*` |
| `campaigns.ts` | `/campaigns/*`, `/campaign-settings` |
| `outreach.ts` | `/outreach-messages/*`, `/leads/{id}/generate-email` |
| `stats.ts` | `/stats` |

### 4.5 Hooks Layer (`src/hooks/`)

| File | Hooks |
|---|---|
| `useLeads.ts` | `useLeads`, `useQualifiedLeads`, `useRejectedLeads`, `useReviewLeads`, `useLead`, `useUpdateLead`, `useDeleteLead` |
| `useCampaigns.ts` | `useCampaigns`, `useCampaign`, `useCampaignMessages`, `useCampaignSettings`, `useCreateCampaign`, `useUpdateCampaign`, `useDeleteCampaign`, `useUpdateCampaignSettings` |
| `useOutreach.ts` | `useOutreachMessages`, `useOutreachMessage`, `useUpdateOutreachMessage`, `useApproveOutreachMessage`, `useRegenerateOutreachMessage`, `useGenerateEmailForLead` |
| `useStats.ts` | `useStats` |

### 4.6 Providers (`src/providers/`)
- `QueryProvider.tsx` — Wraps app with `QueryClientProvider`
- `ToastProvider.tsx` — Global toast notification system (`success`, `error`, `info`)
- `ThemeProvider.tsx` — Dark/light mode toggle with system preference detection

---

## 5. Database Design

### 5.1 Entity Relationship Diagram

```
┌─────────────────┐          ┌──────────────────────────┐
│      lead       │          │  lead_outreach_message    │
│─────────────────│    1:N   │──────────────────────────│
│ id (PK)         │◄─────────│ id (PK)                  │
│ google_place_id │          │ lead_id (FK → lead.id)   │
│ name            │          │ campaign_id (FK→camp.id) │
│ business_type   │          │ message_type             │
│ address         │          │ subject                  │
│ phone_number    │          │ website                  │
│ email           │          │ body                     │
│ rating          │          │ cta                      │
│ latitude/lng    │          │ generated_by             │
│ status          │          │ model_name               │
│ lead_score      │          │ status                   │
│ is_qualified    │          │ review_notes             │
│ review_status   │          │ created_at / updated_at  │
│ cleaned_email   │          └──────────────────────────┘
│ cleaned_website │                       ▲
│ cleaned_phone   │                       │ N:1
│ created_at/upd  │          ┌────────────┴─────────────┐
└─────────────────┘          │         campaign          │
                             │──────────────────────────│
                             │ id (PK)                  │
                             │ name                     │
                             │ campaign_type            │
                             │ target_business_type     │
                             │ offer                    │
                             │ status                   │
                             │ created_at / updated_at  │
                             └──────────┬───────────────┘
                                        │ 1:1
                             ┌──────────▼───────────────┐
                             │    campaign_settings      │
                             │──────────────────────────│
                             │ id (PK)                  │
                             │ campaign_id (FK, UNIQUE) │
                             │ restaurant_name          │
                             │ restaurant_location      │
                             │ sender_name              │
                             │ reply_email              │
                             │ offer                    │
                             │ call_to_action           │
                             │ brand_voice              │
                             └──────────────────────────┘

┌──────────────────────────┐
│    platform_settings      │   ← Global Singleton (1 record)
│──────────────────────────│
│ id (PK)                  │
│ restaurant_name          │
│ restaurant_location      │
│ sender_name              │
│ reply_email              │
│ offer                    │
│ call_to_action           │
│ brand_voice (nullable)   │
└──────────────────────────┘
```

### 5.2 Table Summary

| Table | Rows Expected | Notes |
|---|---|---|
| `lead` | Hundreds–Thousands | Core ingestion table |
| `campaign` | 5–50 | Admin managed |
| `campaign_settings` | 1:1 with campaign | Per-campaign config |
| `platform_settings` | 1 (singleton) | Global AI generation config |
| `lead_outreach_message` | Many | 1–4 per lead/campaign pair |

### 5.3 Migration Tooling
- **Alembic** is configured (`alembic/env.py`, `alembic.ini`)
- Migration files are in `alembic/versions/`
- The `Base.__tablename__` uses auto CamelCase→snake_case conversion

---

## 6. API Contract (All Endpoints)

**Base Path:** `http://localhost:8000/api/v1`

| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/health` | None | `{status, db, timestamp}` |
| POST | `/leads/discover` | None | Discovery summary |
| POST | `/leads/qualify` | None | Qualification counts |
| GET | `/leads/qualified` | None | `Lead[]` |
| GET | `/leads/rejected` | None | `Lead[]` |
| GET | `/leads/review` | None | `Lead[]` |
| GET | `/leads` | None | `Lead[]` (paginated, filterable) |
| GET | `/leads/{id}` | None | `Lead` |
| PATCH | `/leads/{id}` | None | `Lead` |
| DELETE | `/leads/{id}` | None | `Lead` (deleted) |
| GET | `/campaigns` | None | `Campaign[]` |
| POST | `/campaigns` | None | `Campaign` |
| GET | `/campaigns/{id}` | None | `Campaign` |
| PATCH | `/campaigns/{id}` | None | `Campaign` |
| DELETE | `/campaigns/{id}` | None | `Campaign` (deleted) |
| GET | `/campaign-settings` | None | `PlatformSettings` |
| PATCH | `/campaign-settings` | None | `PlatformSettings` (upsert) |
| GET | `/outreach-messages` | None | `OutreachMessage[]` |
| GET | `/outreach-messages/{id}` | None | `OutreachMessage` |
| PATCH | `/outreach-messages/{id}` | None | `OutreachMessage` |
| POST | `/outreach-messages/{id}/approve` | None | `OutreachMessage` |
| POST | `/outreach-messages/{id}/regenerate` | None | `OutreachMessage` (new record) |
| POST | `/leads/{id}/generate-email` | None | `OutreachMessage` |
| GET | `/stats` | None | Aggregate counts object |

> **⚠️ No authentication on any endpoint.** This is a significant gap (see Section 17).

---

## 7. Backend Request–Response Lifecycle

```
Browser / Frontend
       │
       │  HTTP Request (e.g. PATCH /api/v1/outreach-messages/13)
       ▼
┌──────────────────────────────────────────┐
│  Next.js Rewrite Proxy (port 3000)       │
│  → forwards to http://localhost:8000      │
└──────────────────────┬───────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────┐
│  Uvicorn ASGI Server                     │
│  (receives raw HTTP, creates ASGI scope) │
└──────────────────────┬───────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────┐
│  ① RequestLoggingMiddleware               │
│  - Records start time                    │
│  - Logs: method + path                   │
└──────────────────────┬───────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────┐
│  ② CORSMiddleware                        │
│  - Adds Access-Control-Allow-Origin      │
│  - Handles preflight OPTIONS requests    │
└──────────────────────┬───────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────┐
│  ③ Exception Handlers                    │
│  - Catches EntityNotFoundError → 404     │
│  - Catches CateringAppException → custom │
│  - Catches validation errors → 422       │
└──────────────────────┬───────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────┐
│  FastAPI Router → Endpoint Function      │
│                                          │
│  ④ Pydantic Request Validation           │
│  - Body parsed and validated             │
│  - Type coercion applied                 │
│  - 422 returned on failure               │
└──────────────────────┬───────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────┐
│  ⑤ Dependency Injection                  │
│  - `get_db_session` creates AsyncSession │
│  - Session is injected into handler      │
└──────────────────────┬───────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────┐
│  ⑥ Service Layer (business logic)        │
│  - e.g. email_generation_service.generate│
│  - Orchestrates repository calls         │
│  - Calls external APIs if needed         │
└──────────────────────┬───────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────┐
│  ⑦ Repository Layer (DB access)          │
│  - SQLAlchemy 2.0 async ORM queries      │
│  - commit / refresh / rollback           │
└──────────────────────┬───────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────┐
│  PostgreSQL (asyncpg driver)             │
└──────────────────────┬───────────────────┘
                       │  result rows
                       ▼
┌──────────────────────────────────────────┐
│  ⑧ Pydantic Response Serialization       │
│  - ORM → Pydantic model (`from_attributes│
│  - JSON encoding                         │
└──────────────────────┬───────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────┐
│  RequestLoggingMiddleware (exit)         │
│  - Logs response status + latency (ms)   │
└──────────────────────┬───────────────────┘
                       │
                       ▼
                  HTTP Response
                  → Back to Browser
```

---

## 8. Frontend Request–Response Lifecycle

```
User Action (e.g. click "Approve")
       │
       ▼
┌───────────────────────────────────────────┐
│  React Component (OutreachPage.tsx)       │
│  - Calls useMutation hook                 │
│  - Sets loading state                     │
└──────────────────────┬────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────┐
│  TanStack Query (useMutation)             │
│  - Manages isPending / isError / isSuccess│
│  - Calls mutationFn (service method)      │
└──────────────────────┬────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────┐
│  Service Layer (outreachService.approve)  │
│  - Calls apiPost('/outreach-messages/{id}/│
│    approve', {review_notes})              │
└──────────────────────┬────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────┐
│  lib/api.ts (apiFetch wrapper)            │
│  - Sets Content-Type: application/json    │
│  - Attaches 15s AbortController timeout  │
│  - Sends fetch() to /api/v1/...          │
└──────────────────────┬────────────────────┘
                       │  (intercepted by Next.js proxy)
                       ▼
            FastAPI Backend
                       │
                       ▼
┌───────────────────────────────────────────┐
│  Response parsing (apiFetch)             │
│  - 2xx → parse JSON → return typed T     │
│  - 4xx/5xx → parse error body → throw    │
│  - Timeout → throw "Request timed out"   │
└──────────────────────┬────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────┐
│  TanStack Query (onSuccess/onError)       │
│  - onSuccess: invalidateQueries (refetch) │
│  - Updates query cache with new data     │
└──────────────────────┬────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────┐
│  React Component re-renders               │
│  - ToastProvider shows success/error      │
│  - Status badge updates automatically    │
│  - List refreshes via cache invalidation │
└───────────────────────────────────────────┘
```

---

## 9. Agent Automated Workflow

The system models three conceptual "AI Agents" (currently all triggered manually via API):

```
┌──────────────────────────────────────────────────────────────────┐
│                  AGENT 1: Lead Discovery Agent                    │
│                                                                  │
│  Trigger: POST /api/v1/leads/discover                            │
│                                                                  │
│  Pipeline:                                                       │
│  1. Read TARGET_BUSINESS_CATEGORIES from config                  │
│  2. For each category:                                           │
│     a. Call Apify actor (compass/crawler-google-places)          │
│     b. Wait for run to SUCCEED (120s timeout, polling)           │
│     c. Fetch dataset items (normalized to Google Places shape)   │
│  3. For each place result:                                       │
│     a. Check google_place_id for duplicates in DB                │
│     b. Derive contact email from website domain                  │
│     c. INSERT into `lead` table with status=DISCOVERED           │
│  4. Return summary (scanned, ingested, duplicates skipped)       │
└─────────────────────────────┬────────────────────────────────────┘
                              │ Feeds into
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                AGENT 2: Qualification Agent                       │
│                                                                  │
│  Trigger: POST /api/v1/leads/qualify                             │
│                                                                  │
│  Pipeline:                                                       │
│  1. Fetch all DISCOVERED (unprocessed) leads from DB             │
│  2. For each lead:                                               │
│     a. LeadCleanupService:                                       │
│        - Normalize email (lowercase/strip)                       │
│        - Normalize website (strip protocol/www)                  │
│        - Normalize phone (digits + +)                            │
│        - Reject: bad name keywords, personal email domains,      │
│          no contact info at all                                  │
│     b. LeadQualificationService (scoring):                       │
│        - Email: +25 pts                                          │
│        - Website: +20 pts                                        │
│        - Phone: +15 pts                                          │
│        - Business type match: +20 pts                            │
│        - Address/coords: +20 pts                                 │
│        - Score ≥70 → QUALIFIED                                   │
│        - Score 40–69 → REVIEW_REQUIRED                           │
│        - Score <40 → REJECTED                                    │
│     c. UPDATE lead with score, cleaned fields, unified status    │
│  3. Return (processed, qualified, review_required, rejected)     │
└─────────────────────────────┬────────────────────────────────────┘
                              │ Feeds into
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                  AGENT 3: Outreach Agent                          │
│                                                                  │
│  Trigger: POST /api/v1/leads/{id}/generate-email                 │
│                                                                  │
│  Pipeline:                                                       │
│  1. Validate lead exists (status=QUALIFIED expected)             │
│  2. Validate campaign exists                                     │
│  3. Load PlatformSettings singleton (must be configured)         │
│  4. EmailGenerationService.generate():                           │
│     a. Build system prompt (restaurant persona + brand voice)    │
│     b. Build user prompt (lead business data + message type)     │
│     c. Call OpenAI GPT-4o with structured output schema          │
│        (GeneratedEmailContent: subject, body, cta)               │
│     d. Parse response with Pydantic validation                   │
│  5. INSERT into lead_outreach_message (status=generated)         │
│  6. Return new message record                                    │
│                                                                  │
│  Regenerate: POST /outreach-messages/{id}/regenerate             │
│  → Creates NEW record with same lead/campaign/type               │
│  → Does NOT delete or replace the old record                     │
└──────────────────────────────────────────────────────────────────┘

Human Review Layer (Phase 4 UI):
  Admin reviews in Outreach page → edits/approves/rejects
  Approved → status=APPROVED (ready to send)
  Sent → status=SENT (Phase 5: SendGrid integration pending)
```

---

## 10. System's User Workflow

```
ADMIN USER JOURNEY:

Step 1: Configure Platform
  → /campaigns → Campaign [id] → Settings Tab
  → Fill: restaurant name, sender, reply email, offer, CTA, brand voice
  → PATCH /api/v1/campaign-settings (saves PlatformSettings singleton)

Step 2: Create Campaign
  → /campaigns/new → Fill campaign name, type, industry, offer
  → POST /api/v1/campaigns

Step 3: Discover Leads
  → POST /api/v1/leads/discover (currently API-only, no UI button)
  → Apify scraper runs, ingests raw leads into DB

Step 4: Qualify Leads
  → POST /api/v1/leads/qualify (currently API-only, no UI button)
  → Leads are scored and categorized

Step 5: Review Leads
  → /leads/qualified → Browse scored leads
  → /leads/review → Manually review borderline leads

Step 6: Assign Leads to Campaign
  → /leads/qualified → Select checkboxes → "Assign to Campaign" → pick campaign
  → Simulated workflow (no real backend endpoint exists for this)

Step 7: Generate Outreach Emails
  → POST /api/v1/leads/{id}/generate-email (currently API-only, no UI button)
  → AI generates personalized email (subject + body + CTA)
  → Stored with status=generated

Step 8: Review & Approve Emails
  → /outreach → Browse generated emails (left pane)
  → Click row → Preview (right pane)
  → Edit copy if needed (status → edited)
  → Click Approve (status → approved)

Step 9: Send Emails (PENDING — Phase 5)
  → Approved messages queued for SendGrid
  → Lead status updated to CONTACTED
```

---

## 11. Software Patterns Used

| Pattern | Where Applied |
|---|---|
| **Repository Pattern** | `BaseRepository[T]` + specialized repositories per model — decouples DB access from business logic |
| **Service Layer Pattern** | `LeadService`, `EmailGenerationService`, etc. — orchestrates multi-repository operations |
| **Dependency Injection** | FastAPI's `Depends(get_db_session)` — DB session injected per-request |
| **Singleton Pattern** | `PlatformSettings` (one record), `lead_service = LeadService()`, `email_generation_service = EmailGenerationService()` — module-level singletons |
| **Strategy Pattern** | `LeadService.__init__` selects between `ApifyPlacesService` or `GooglePlacesService` based on `LEAD_PROVIDER` env var — pluggable provider |
| **Adapter Pattern** | `ApifyPlacesService._map_search_item()` — transforms Apify's schema into the same shape as Google Places, so `LeadService` is provider-agnostic |
| **Generic Repository (Template Method)** | `BaseRepository[ModelType]` uses Python generics — all CRUD methods are type-safe and reusable |
| **Data Transfer Object (DTO)** | Pydantic schemas (`LeadResponse`, `CampaignCreate`, etc.) — strict separation between DB models and API surface |
| **Provider Pattern** | `QueryProvider`, `ToastProvider`, `ThemeProvider` — React context providers wrapping the app |
| **Custom Hook Pattern** | `useLeads`, `useCampaigns`, `useOutreach` — data-fetching logic encapsulated in reusable hooks |
| **Query Key Factory Pattern** | `outreachKeys`, `campaignKeys`, `leadKeys` — structured TanStack Query key factories for cache management |
| **Facade Pattern** | `lib/api.ts` — single `apiFetch` wrapper abstracts fetch, headers, timeout, error parsing |
| **Factory Pattern** | `EmailGenerationService._build_system_prompt()` + `_build_user_prompt()` — constructs AI prompt objects |
| **Lifespan/Context Manager** | `@asynccontextmanager async def lifespan(app)` — controls DB pool startup/shutdown |

---

## 12. Design Principles Maintained

| Principle | Evidence |
|---|---|
| **Single Responsibility** | Each service does one job. `LeadCleanupService` only normalizes. `LeadQualificationService` only scores. |
| **Open/Closed** | Adding a new lead provider requires only a new service class + setting swap — no changes to `LeadService` |
| **Dependency Inversion** | `LeadService` depends on abstract interface (both providers expose same two methods) |
| **DRY (Don't Repeat Yourself)** | `BaseRepository` eliminates duplicated CRUD logic; `apiFetch` centralizes all HTTP concerns |
| **Separation of Concerns** | Clear layers: Router → Service → Repository → DB. Frontend: Page → Hook → Service → API |
| **Fail Fast / Guard Clauses** | Every endpoint validates lead/campaign/settings existence before proceeding |
| **Immutability of Enums** | All status transitions use `str` enums (`LeadStatus`, `MessageStatus`) — no raw string magic |
| **Async-First** | All I/O (DB, HTTP) is fully async (`async def`, `await`) — no blocking calls |
| **Convention over Configuration** | `Base.__tablename__` auto-generates table names from class names |
| **Graceful Degradation** | Apify service returns `[]` on missing token; `get_place_details()` returns `None` and falls back to search item |

---

## 13. Testing Coverage

### 13.1 What Exists

| File | Type | Coverage |
|---|---|---|
| `tests/conftest.py` | Fixtures | `async_client`, `mock_db_session` setup |
| `tests/test_health.py` | Integration | Health endpoint |
| `tests/test_leads.py` | Unit/Integration | discover, list, get by ID, get 404, patch, delete |

**Total: ~6 test cases covering Lead endpoints only.**

### 13.2 What Is Missing

| Missing Test Area | Risk Level |
|---|---|
| Campaign CRUD tests | High |
| Campaign Settings (upsert/get) tests | Medium |
| Outreach message CRUD tests | **Critical** |
| Approve / Regenerate workflow tests | **Critical** |
| Email generation service tests (mocked OpenAI) | High |
| Lead qualification scoring unit tests | High |
| Lead cleanup service unit tests | Medium |
| Stats endpoint tests | Low |
| `anyio` mode declared but `pytest-asyncio` version pinned (may conflict) | Medium |

---

## 14. What Is Done vs. Pending

### ✅ Completed

- Full backend REST API with FastAPI (all 5 domains: leads, campaigns, settings, outreach messages, stats)
- PostgreSQL database with Alembic migration support
- Apify Google Maps scraper integration with deduplication
- AI email generation with OpenAI GPT-4o + structured outputs
- Lead cleanup + scoring pipeline (deterministic 100-point rubric)
- Frontend layout system (dark/light theme, sidebar navigation, shared components)
- Lead Operations Center (all 4 status tabs, inline editing, search/filter)
- Bulk lead selection + campaign assignment (simulated)
- Campaign Management Center (full CRUD, command center view, settings form)
- Outreach Review & Approval Center (split pane, edit, approve, regenerate, bulk approve)
- TypeScript build verified (0 errors, 15 routes compiled)
- Docker Compose setup (PostgreSQL + backend containerization)
- Seed scripts for development data

### ❌ Pending / Not Built

- **Email Sending** (SendGrid API integration — `SENDGRID_API_KEY` present in config but unused)
- **SMS Outreach** (Twilio credentials present in config but completely unused)
- **Analytics Page** (placeholder EmptyState only — no real data, no charts)
- **Pipeline/Kanban Board** (placeholder EmptyState only)
- **Global Settings Page** (`/settings`) — placeholder; actual settings live under `/campaigns/[id]` Settings tab
- **Dashboard KPIs from real API** (all 4 KPI cards on `/dashboard` use hardcoded mock data)
- **Dashboard Activity Feed** from real DB (mock array, not real events)
- **Agent Status Monitor** (mock data — no real agent status endpoint)
- **Lead-to-Campaign Backend Relationship** (no DB table for `lead ↔ campaign` many-to-many mapping)
- **Bulk Email Generation from UI** (no UI button for `POST /leads/discover` or `POST /leads/qualify`)
- **Authentication / Authorization** (completely absent)
- **Pagination on Outreach Page** (UI has no page controls; relies on backend default limit=100)
- **Real-time WebSocket Event Stream** (dashboard shows fake static logs)
- **Reject Message workflow** (`RejectMessageRequest` schema exists in backend but no route uses it)

---

## 15. Inconsistencies & Mismatches

### 15.1 🔴 `CampaignSettings` vs `PlatformSettings` — Design Conflict (Major)

**Problem:** There are **two separate settings models** serving almost identical purposes:

| | `CampaignSettings` (DB table) | `PlatformSettings` (DB table) |
|---|---|---|
| Scope | Per-Campaign (FK to campaign) | Global Singleton |
| Fields | restaurant_name, sender_name, reply_email, offer, CTA, brand_voice | Same fields |
| Used by AI | ❌ NOT used | ✅ Used by `EmailGenerationService` |
| Frontend Form | `CampaignSettingsForm.tsx` (under `/campaigns/[id]`) | Maps to `PATCH /campaign-settings` |
| API Path | `PATCH /campaign-settings` | Same path! |

**Critical Issue:** The frontend `CampaignSettingsForm` calls `PATCH /api/v1/campaign-settings` which maps to `PlatformSettingsService.upsert()` — updating `platform_settings`, **not** `campaign_settings`. The `campaign_settings` table is populated during campaign creation only if the `CampaignCreate` schema includes settings, which it currently doesn't. The `CampaignSettings` DB model exists but is **never written to by any API endpoint**.

**Impact:** `CampaignSettings` is dead code. The system actually works via `PlatformSettings` singleton, but the schema/naming suggests per-campaign isolation that doesn't exist.

### 15.2 🔴 Regenerate Creates New Record, Doesn't Replace

**Problem:** `POST /outreach-messages/{id}/regenerate` creates a **new** `LeadOutreachMessage` record (a different `id`) but returns it. The frontend's `useRegenerateOutreachMessage` hook invalidates cache and re-fetches the list — so a new row appears in the list rather than replacing the selected row. The old record remains in the DB unchanged.

**Mismatch with user expectation:** Users expect "Regenerate" to replace the current email, not add a sibling.

### 15.3 🟡 Lead Status Casing Inconsistency

In `lead_service.py` line 112:
```python
"status": "discovered",  # ← lowercase
```

But `LeadStatus.DISCOVERED = "DISCOVERED"` (uppercase). The DB `Lead.status` column has default `"DISCOVERED"` (uppercase). This means leads ingested via the discovery pipeline get stored with `"discovered"` (lowercase), which won't match enum comparison queries like `Lead.status == LeadStatus.QUALIFIED`.

### 15.4 🟡 `is_qualified` and `review_status` are Deprecated but Still Populated

The `Lead` model comments say these fields are "backward-compat (soft-deprecated)" yet the qualification endpoint still writes both. The frontend `Lead` TypeScript interface includes both. This redundancy causes confusion about which field is the source of truth.

### 15.5 🟡 `/settings` Page is Orphaned

The sidebar has a `/settings` link. The page exists but shows only an EmptyState with `alert()` handler referencing "Phase 2". But Platform Settings are actually accessible under `/campaigns/[id]` → Settings tab. Two different surfaces, one underlying API — no clear navigation path from `/settings` to the real form.

### 15.6 🟡 Dashboard KPI Cards are Hardcoded

The `/dashboard` page shows `"Total Leads: 1,482"`, `"Qualified Leads: 843"` etc. — all hardcoded. The `/stats` API endpoint exists and returns real counts. The dashboard never calls it. The `useStats` hook exists but isn't used on the dashboard.

### 15.7 🟡 Lead → Campaign Assignment is Simulated

The "Assign to Campaign" workflow selects leads and a campaign, shows a toast, but makes no backend API call. There is no `lead_campaign` join table or any endpoint to persist this relationship.

### 15.8 🟡 `RejectMessageRequest` Schema is Dead Code

The `outreach_message.py` schema defines `RejectMessageRequest` but no backend route uses it. There is no `POST /outreach-messages/{id}/reject` endpoint.

---

## 16. Redundancies

| Redundancy | Description |
|---|---|
| `CampaignSettings` table | Defined, never populated by any API — duplicates `PlatformSettings` |
| `is_qualified` field | Redundant with `status == QUALIFIED` — written during qualification, never used in queries |
| `review_status` field | Redundant with unified `status` field — a vestige of the old two-field approach |
| `RejectMessageRequest` Pydantic schema | Defined but no route consumes it |
| Email address derivation | `lead_service._resolve_outreach_email()` generates a guessed email from domain; `LeadCleanupService` normalizes actual email — both fields (`email` and `cleaned_email`) stored, purpose unclear |
| `GOOGLE_MAPS_API_KEY`, `TWILIO_*`, `SENDGRID_API_KEY` in config | Declared but referenced nowhere in actual code paths |
| `apscheduler` in `pyproject.toml` | Installed but not imported or used anywhere |
| `python-jose`, `passlib`, `cryptography`, `python-multipart` | Auth dependencies declared in `pyproject.toml` but zero auth code exists |

---

## 17. Concerns & Observations

### 🔴 Critical

1. **No Authentication Whatsoever.** Every API endpoint is completely public. Any user with network access to port 8000 can discover leads, approve emails, delete campaigns, or read all business data. This is a production blocker.

2. **CORS is `allow_origins=["*"]`** in the backend config. Combined with no auth, this means any website can make API calls to the backend.

3. **OpenAI API Key in `.env`** — if leaked or committed to git, could result in significant billing. No `.gitignore` audit was performed, but the `.env` contains real credentials.

4. **Lead Status Bug** — the `"discovered"` vs `"DISCOVERED"` casing issue in `lead_service.py` means newly ingested leads won't be picked up by the qualification pipeline's `get_unprocessed_leads()` query (which filters by uppercase enum values).

### 🟡 Important

5. **Apify Detail Cache is In-Memory and Non-Persistent.** The `_detail_cache` dict in `apify_places_service.py` lives in process memory only. If the server restarts between discovery and detail lookups, all cached place details are lost. This isn't a bug currently (details are always fetched in the same request) but is architecturally fragile.

6. **Email Resolution is Fabricated.** `_resolve_outreach_email()` creates emails like `info@domain.com` from websites. This is **not** a real email address — it's a guess. Sending to these addresses will likely result in high bounce rates and damage sender reputation.

7. **No Pagination in Outreach UI.** The outreach page fetches all messages (default limit=100). As the system scales this will become a performance problem.

8. **No Loading Skeleton / Optimistic Updates.** The frontend shows spinner states but no skeleton screens. For data tables with 100+ rows, UX degrades significantly on slow connections.

9. **`anyio` not in test dependencies** but used implicitly by `pytest-asyncio`. The `conftest.py` uses `anyio` marks — this may cause test runner failures depending on environment.

10. **No Error Boundary in React.** If a component crashes, the entire app breaks. No `error.tsx` route files defined.

### 🔵 Minor

11. **Dashboard Agent Panel uses `Pause/Play` buttons** with no click handlers — they're purely decorative.

12. **Activity Feed on Dashboard is fake** — shows hardcoded events like "Email Opened" despite no email tracking being implemented.

13. **`AiInsightsCard` scores (Personalization: 85%, Spam Risk: Low)** are static hardcoded values — not computed from actual email content.

14. **`docker-compose.yml` doesn't include a frontend service** — frontend must be run manually.

---

## 18. Suggestions & Recommendations

### Immediate Priority

| # | Suggestion | Effort |
|---|---|---|
| 1 | **Fix lead status casing bug** in `lead_service.py` line 112: `"status": "DISCOVERED"` (uppercase) | 5 min |
| 2 | **Add JWT authentication** — at minimum, a simple API key header check for the MVP | 1–2 days |
| 3 | **Wire dashboard KPIs to `useStats` hook** — replace hardcoded numbers with real API data | 2 hours |
| 4 | **Remove `CampaignSettings` dead code** or implement it properly with FK-based per-campaign overrides | Half day |
| 5 | **Add `POST /leads/{id}/reject` endpoint** using existing `RejectMessageRequest` schema | 1 hour |

### Architecture Improvements

| # | Suggestion | Effort |
|---|---|---|
| 6 | **Add `lead_campaign` join table** (many-to-many) to persist lead→campaign assignments; implement `POST /campaigns/{id}/leads/assign` endpoint | 1–2 days |
| 7 | **Make Regenerate update-in-place** or at minimum return the new message and auto-switch the preview to the new record | Half day |
| 8 | **Replace in-memory Apify cache** with Redis or a DB-backed detail lookup for resilience across restarts | 1 day |
| 9 | **Add `error.tsx` and `loading.tsx`** route files for proper Next.js error boundaries and loading states | 2 hours |
| 10 | **Create a global `/settings` page** that properly links to `PATCH /campaign-settings` — remove the confusing per-campaign Settings tab overlap | Half day |

### Testing & Quality

| # | Suggestion | Effort |
|---|---|---|
| 11 | **Write tests for Campaigns, Outreach Messages, and Email Generation** (mock OpenAI client) | 1–2 days |
| 12 | **Add unit tests for LeadQualificationService** and `LeadCleanupService` (pure functions, easy to test) | 2 hours |
| 13 | **Add `sendgrid` to CI** integration test (Phase 5 readiness) | 1 day |

### Phase 5 Readiness

| # | Suggestion | Effort |
|---|---|---|
| 14 | **Implement SendGrid email dispatch** — `POST /outreach-messages/{id}/send` → mark as SENT, update lead → CONTACTED | 1–2 days |
| 15 | **Build Analytics page** using real `GET /stats` + add per-campaign breakdown endpoint | 2–3 days |
| 16 | **Build Pipeline Kanban board** — fetch leads grouped by `LeadStatus`, drag-drop to change status | 2–3 days |
| 17 | **Add WebSocket or SSE** for real-time dashboard event stream (replace fake activity feed) | 2 days |
| 18 | **Add Discover/Qualify trigger buttons** to the UI — currently these powerful workflows are only accessible via Swagger docs | 1 day |

---

## Summary Card

```
┌─────────────────────────────────────────────────────────────────┐
│                        PROJECT HEALTH                           │
├──────────────────────────┬──────────────────────────────────────┤
│ Backend Architecture     │  ✅ Excellent — Clean layered design  │
│ Frontend Architecture    │  ✅ Good — TanStack Query, typed DTOs │
│ Database Design          │  🟡 Good, with CampaignSettings issue │
│ API Coverage             │  ✅ Full CRUD on all core entities     │
│ Authentication           │  🔴 MISSING — Critical gap            │
│ AI Integration (OpenAI)  │  ✅ Working structured output         │
│ Lead Discovery (Apify)   │  ✅ Working with fallback             │
│ Email Sending (SendGrid) │  🔴 NOT IMPLEMENTED                   │
│ Frontend Pages           │  🟡 3/10 are placeholder EmptyStates  │
│ Testing                  │  🔴 ~10% coverage (leads only)        │
│ TypeScript Build         │  ✅ Zero errors, 15 routes pass       │
│ Docker Support           │  🟡 DB + Backend only, no Frontend     │
│ Documentation            │  🟡 README + AGENTS.md exist          │
└──────────────────────────┴──────────────────────────────────────┘
```
