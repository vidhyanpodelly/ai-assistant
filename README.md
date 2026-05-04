# Multi-tenant Assistant Platform (Debales AI)

A multi-tenant AI platform featuring a dynamic, config-driven admin dashboard and a controlled AI assistant. This project demonstrates secure tenant isolation and a strictly layered architecture.

## Overview

This application allows different projects (tenants) to have their own scoped data, customized dashboards, and integrated AI assistant. It is built to show how a single application can serve multiple organizations while maintaining complete data isolation.

## Key Features

- **Multi-tenancy**: Robust isolation between different projects using a membership-based access system.
- **Config-Driven Admin UI**: The admin dashboard is rendered entirely based on MongoDB configuration.
- **Traceable AI Assistant**: A conversation interface with visible processing steps and grounded context.
- **Layered Architecture**: Organized into Access, Service, Route, and UI layers for maximum maintainability.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Validation**: Zod (Full schema validation on both Client and Server)
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS & Framer Motion

## Getting Started

### Prerequisites

- Node.js 18 or later
- A running MongoDB instance

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in a `.env` file:
   ```env
   MONGODB_URI=your_mongodb_uri
   OPENROUTER_API_KEY=your_api_key
   ```

3. Seed the database with initial data:
   ```bash
   npx tsx scripts/seed.ts
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Architecture

This project follows a strict **Layered Architecture** (Access → Services → Routes → Hooks → UI):

1.  **Access Layer** (`src/lib/access.ts`): Pure, side-effect-free authorization rules for project membership and roles.
2.  **Service Layer** (`src/services/`): Core business logic. Services handle database interactions, AI streaming coordination, and integration simulations.
3.  **Route Layer** (`src/app/api/`): Thin API handlers. They validate incoming requests using **Zod**, verify sessions, and delegate work to the Service layer.
4.  **Hook Layer** (`src/hooks/`): Client-side state management using **TanStack Query** for fetching, caching, and mutations.
5.  **UI Layer** (`src/components/` & `src/app/`): Purely presentation components that react to hook states.

## Multi-tenant Model

Isolation is the core of the platform's design:

- **Tenant Boundaries**: Every Project acts as a unique tenant. All data (Conversations, Messages, Configs) is strictly filtered by `projectId`.
- **Membership Enforcement**: Access is controlled via a `Membership` model linking `Users` to `Projects` with roles (`admin` or `member`).
- **Data Scoping**: Every database query in the Service layer includes the `projectId` as a required filter, ensuring users can never cross tenant boundaries.
- **Dynamic Configuration**: Each project has its own `DashboardConfig`, allowing unique layouts per tenant.

## Config-Driven Behavior

The **Project Admin Dashboard** is 100% driven by the `DashboardConfig` collection in MongoDB.
- **To Verify**: Edit the `sections` or `widgets` array in the `DashboardConfig` document for a project. The UI will automatically re-render sections, update labels, and re-order components without any code changes.

## Security & Validation

- **Server-Side Authorization**: Every API request verifies project access and user roles.
- **Zod Validation**: All API inputs (body/query) and client-side data fetches are validated against Zod schemas.
- **Error Handling**: Custom error states and user-friendly messages for forbidden access or service failures.
