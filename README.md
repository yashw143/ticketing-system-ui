# Ticketing System — Angular UI

A full-stack ticketing application with an Angular 19 frontend, ASP.NET Core Web API backend, and SQL Server database. The entire stack is containerized with Docker and orchestrated with Docker Compose. Both the API and UI have continuous deployment pipelines that build and push images to Docker Hub on every commit.

This repo contains the **Angular frontend**. The backend lives in a [separate repository](https://hub.docker.com/r/yeshwanthy834961/ticket-api) (Docker image published).

---

## Live Demo

Clone, then bring up the entire stack with one command:

```bash
docker-compose up -d
```

- UI: http://localhost:4200
- API: http://localhost:5000
- Swagger: http://localhost:5000/swagger

No source code required — all images are pulled from Docker Hub.

---

## Tech Stack

**Frontend**
- Angular 19 (standalone components)
- Tailwind CSS for styling
- RxJS for HTTP and reactive data flow
- TypeScript

**Backend** (separate repo)
- ASP.NET Core 8 Web API
- Entity Framework Core with code-first migrations
- Swagger / OpenAPI documentation
- CORS configured for Angular origin

**Infrastructure**
- SQL Server 2019 (containerized)
- nginx (serves built Angular app)
- Docker multi-stage builds
- Docker Compose orchestration
- GitHub Actions CI/CD
- Watchtower for automated container updates

---

## Features

- Full CRUD for support tickets (create, list, edit via modal, delete with confirmation)
- Dashboard with live statistics (total / open / closed counts)
- Client-side routing with deep-link support
- Form validation and loading states
- Styled with Tailwind's utility-first approach

---

## Architecture

```
┌─────────────────────────────┐
│       Browser (user)        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐        ┌──────────────────────┐
│  nginx + Angular  (:4200)   │───────▶│  ASP.NET API (:5000) │
└─────────────────────────────┘        └──────────┬───────────┘
                                                  │
                                                  ▼
                                       ┌──────────────────────┐
                                       │  SQL Server (:1433)  │
                                       └──────────────────────┘
```

All three tiers run as Docker containers on the same Docker network, communicating by service name (e.g., the API connects to SQL Server at `sqlserver:1433` rather than an IP address).

---

## Multi-Stage Dockerfile

The Angular container uses a two-stage build to keep the final image small:

1. **Build stage** — Node.js image compiles the Angular app with `ng build`
2. **Runtime stage** — nginx:alpine serves the static files

Final image size: ~50 MB (vs. ~1.5 GB if Node were kept in the runtime image).

The nginx config includes a `try_files` directive so client-side routes (e.g., `/create`) serve `index.html` and let Angular's router handle them — essential for SPA routing to survive page refreshes.

---

## CI/CD Pipeline

Both the frontend and backend use GitHub Actions workflows that, on every push to `main`:

1. Check out source code
2. Log in to Docker Hub using repository secrets
3. Build the Docker image (with GitHub Actions cache for faster subsequent builds)
4. Push the tagged image to Docker Hub

Watchtower runs alongside the application containers and polls Docker Hub every few minutes. When it detects an updated image, it gracefully stops the old container and starts a new one from the latest image — zero-touch continuous deployment.

---

## Running Locally

### Prerequisites
- Docker Desktop
- Git

### Option 1: Full stack (recommended)

Clone this repo and the `docker-compose.yml` from the API repo, then:

```bash
docker-compose up -d
```

All three services come up. Open http://localhost:4200.

### Option 2: Angular only (development mode)

```bash
git clone https://github.com/yashw143/ticketing-system-ui.git
cd ticketing-system-ui
npm install
ng serve
```

Runs on http://localhost:4200 with hot reload. Requires the API to be running separately at http://localhost:5000.

### Option 3: Build the Docker image locally

```bash
docker build -t ticket-ui:latest .
docker run -d -p 4200:80 ticket-ui:latest
```

---

## Project Structure

```
src/
├── app/
│   ├── features/
│   │   └── tickets/
│   │       ├── ticket-list/      # Dashboard with CRUD table + edit modal
│   │       └── ticket-form/      # Create ticket form
│   ├── models/                   # TypeScript interfaces (Ticket)
│   ├── services/                 # HTTP service layer
│   ├── app.config.ts             # Standalone app configuration
│   └── app.routes.ts             # Route definitions
├── styles.css                    # Tailwind directives
└── main.ts                       # Bootstrap entry
Dockerfile                         # Multi-stage build config
nginx.conf                         # SPA-aware nginx config
.github/workflows/                 # GitHub Actions CI/CD
```

---

## Notable Implementation Details

**Empty response handling.** ASP.NET Core's `NoContent()` returns an empty HTTP 204. Angular's `HttpClient` tries to parse responses as JSON by default, which fails silently on empty bodies. The fix is `responseType: 'text'` on the delete call so the Observable completes properly.

**CORS configuration.** The API allows both `localhost:4200` (dev and containerized) so the same backend image works for both `ng serve` and Docker deployment without code changes.

**Docker layer caching.** `package*.json` is copied before the rest of the source so `npm install` only re-runs when dependencies actually change — turning most rebuilds from 60+ seconds into a few seconds.

**Build artifact path.** Angular 17+ writes to `dist/<project>/browser/`. The Dockerfile copies from the correct subpath.

---

## What I Learned

Building this end-to-end taught me:

- Multi-stage Docker builds and why runtime-only images matter
- SPA routing behind a web server (the `try_files` trick)
- How CORS actually works — origins are scheme + host + port, which is why containerization broke it
- Container networking — service name resolution via Docker's built-in DNS
- The empty-response pitfall between .NET and Angular HTTP clients
- GitHub Actions workflow syntax and secret management
- The full CI → registry → CD loop with Docker Hub and Watchtower

---

## License

MIT
