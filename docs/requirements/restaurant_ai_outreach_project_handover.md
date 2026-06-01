# AI Outreach & Revenue Automation Platform

## Project Handover Document

## 1. Project Overview

This project is a pilot implementation for one restaurant business in Los Angeles. The objective is to build an AI-powered outreach and revenue automation platform with two core agents:

1. Lapsed Customer Reactivation Agent
2. Catering Lead Generation & Outreach Agent

The platform should be designed as a scalable system so it can later be expanded across the client’s other restaurants and eventually commercialized for additional restaurant owners.

---

# 2. Scope of Work

## Agent 1 — Lapsed Customer Reactivation Agent

### Objective

Re-engage inactive customers from Toast POS data through automated outreach campaigns.

### Core Features

### Customer Data Import

Source:

- Toast POS API (preferred)
- CSV upload (fallback if API access is unavailable)

### Customer Data Fields

- customer\_id
- full\_name
- phone
- email
- last\_order\_date
- order\_count
- lifetime\_spend
- favorite\_items
- last\_order\_amount

### Lapsed Customer Segmentation

Support filtering by:

- 60 days inactive
- 90 days inactive
- Custom inactivity period

### Outreach Channels

- SMS via Twilio
- Email via SendGrid

Future consideration:

- iMessage / blue-message integration research

### Campaign Flow

- Day 0 — Initial outreach
- Day 3 — Follow-up 1
- Day 7 — Follow-up 2
- Day 14 — Final reminder / offer

### Personalization

Messages may be generated dynamically using:

- Customer name
- Last visit date
- Favorite item
- Offer or discount
- Restaurant branding

---

# Agent 2 — Catering Lead Generation & Outreach Agent

## Objective

Generate new catering business by identifying nearby businesses and automating outbound outreach.

## Lead Source

- Google Places API

## Target Businesses

- Law offices
- Schools
- Production studios
- Insurance offices
- Corporate offices
- Businesses with multiple employees

Not included:

- Restaurants

## Search Radius

- 10 miles from restaurant location

## Lead Qualification Criteria

- Matches target business category
- Located within search radius
- Appears to have multiple employees
- Has available phone number and/or website

## Outreach Channels

- Email
- SMS

## Pipeline Stages

- New Lead
- Contacted
- Follow-up Sent
- Replied
- Interested
- Qualified
- Meeting Requested
- Booked
- Closed Won
- Closed Lost

---

# 3. Dashboard

A web-based internal dashboard will be built as the central management panel for monitoring both agents.

This dashboard was proposed during the project discussion and accepted as part of the implementation scope.

## Dashboard Modules

### Overview Dashboard

Displays:

- Active campaigns
- Messages sent
- Response rates
- Conversion counts
- Revenue recovered
- Catering bookings

### Customer Reactivation Dashboard

Displays:

- Total lapsed customers
- Customers contacted
- Responses received
- Converted customers
- Revenue recovered

### Catering Pipeline Dashboard

Displays:

- Leads found
- Contacted leads
- Interested leads
- Qualified leads
- Meetings booked
- Closed deals
- Revenue generated

### Outreach Logs

Tracks:

- Recipient
- Channel
- Message content
- Timestamp
- Delivery status
- Reply status
- Campaign association

### CSV Upload Interface

Used if Toast API is unavailable.
Allows manual upload of customer data exports.

---

# 4. Technical Architecture

## Frontend

- React.js

## Backend

- Python (FastAPI preferred)

## Database

- PostgreSQL

## Automation Layer

- n8n for workflow orchestration where appropriate
- Custom Python services for advanced logic where needed

## Messaging Integrations

- Twilio for SMS
- SendGrid for Email

## AI Layer

- OpenAI API for message generation and personalization

## Lead Discovery

- Google Places API

---

# 5. Database Schema

## customers

- id
- toast\_customer\_id
- full\_name
- phone
- email
- last\_order\_date
- order\_count
- lifetime\_spend
- favorite\_items
- status
- created\_at
- updated\_at

## campaigns

- id
- name
- campaign\_type
- channel
- status
- created\_at
- scheduled\_at

## campaign\_messages

- id
- campaign\_id
- recipient\_id
- recipient\_type
- message\_content
- delivery\_status
- opened
- clicked
- replied
- sent\_at

## leads

- id
- business\_name
- category
- website
- phone
- email
- address
- distance\_miles
- status
- notes
- created\_at

## lead\_activities

- id
- lead\_id
- activity\_type
- activity\_note
- created\_at

## replies

- id
- lead\_id or customer\_id
- channel
- reply\_message
- sentiment
- is\_positive
- requires\_human\_review
- created\_at

## conversions

- id
- source\_type
- source\_id
- conversion\_value
- conversion\_type
- converted\_at

---

# 6. Core Workflows

## Agent 1 Workflow

1. Import customer data from Toast or CSV
2. Identify lapsed customers
3. Generate personalized outreach message
4. Send SMS or email
5. Track delivery and replies
6. Log engagement
7. Track recovered revenue

---

## Agent 2 Workflow

1. Search businesses using Google Places API
2. Filter and qualify leads
3. Save leads to database
4. Generate personalized outreach message
5. Send outreach campaign
6. Run automated follow-up sequence
7. Track replies
8. Move lead through pipeline stages
9. Track booked catering conversions

---

# 7. Implementation Plan

## Phase 1 — Project Setup

- Repository setup
- Environment setup
- Supabase setup
- API credential configuration

## Phase 2 — Agent 1 Development

- Toast integration or CSV import
- Customer segmentation logic
- SMS/email workflow
- Tracking system

## Phase 3 — Agent 2 Development

- Google Places integration
- Lead collection system
- Outreach automation
- Lead pipeline system

## Phase 4 — Dashboard Development

- Admin dashboard UI
- Campaign monitoring
- Analytics reporting
- Lead management views

## Phase 5 — Testing & Deployment

- QA testing
- Bug fixing
- Production deployment
- Client handover

---

# 8. Pending Requirements Before Development Starts

The following items are still required from the client:

## Required Credentials / Access

- Toast API access details OR confirmation of CSV export workflow
- Twilio account credentials
- SendGrid account credentials or sender domain access
- Google Places API key
- OpenAI API key (if client-managed)

## Business Information Required

- Restaurant address (for 10-mile lead search radius)
- Restaurant brand name
- Logo assets
- Brand colors

---

# 9. Future Expansion (Out of Current Scope)

Not included in current MVP scope:

- Multi-restaurant deployment
- SaaS subscription system for external restaurant clients
- Additional AI agents for restaurant operations
- Logistics company AI automation
- Long-term maintenance after support period

These may be handled as future project phases.

---

# 10. Support

Included with current project:

- 2 months post-delivery bug support

Not included:

- Ongoing maintenance subscription
- New feature development after launch
- Future integrations beyond current scope

