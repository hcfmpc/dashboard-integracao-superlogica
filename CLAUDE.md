# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dashboard frontend for condominium managers to monitor CNAB 240 Sicoob boleto integration status with the Superlógica platform. Displays real-time processing state per condominium with auto-refresh every 15 seconds.

## SDD Workflow

This project uses **Spec-Driven Development**. Before implementing anything, read these files in order:

1. `sdd/01-spec.md` — Business requirements and user stories (immutable truth)
2. `sdd/02-plan.md` — Technical architecture and decisions
3. `sdd/03-task.md` — Atomic task backlog (implement only what's listed here)
4. `sdd/04-context.md` — Current state, confirmed decisions, and completed work

**Update `sdd/04-context.md`** after completing any phase to document what was implemented and any decisions made.

## Commands

```bash
# After project initialization (Phase 6.1):
ng serve --proxy-config proxy.conf.json   # Dev server at http://localhost:4200
npx vitest                                # Run tests
npx vitest --coverage                     # Run tests with coverage report
ng build --configuration production       # Production build

# Run a single test file:
npx vitest src/app/services/polling.service.spec.ts
```

The API (.NET) runs on `:5000`. The Angular dev proxy at `proxy.conf.json` forwards `/api/*` → `http://localhost:5000`.

## Stack

- **Angular v21** — standalone components (no `NgModule`)
- **Angular Signals** — `signal`, `computed`, `effect` for all reactivity; no RxJS subscriptions, no NgRx
- **Angular Material v21** — UI components and theming
- **Vitest** — test runner (Angular v21 standard); `HttpClientTestingModule` for HTTP mocks
- **SCSS** — styling with CSS custom properties

## Architecture

### Reactivity Pattern

Central state lives in `PollingService` as signals:
- `signal<StatusCondominio[]>()` — raw API data
- `computed()` — derived state (failure counts, filtered lists)
- `effect()` — starts the 15-second polling interval; cleanup via `onCleanup(() => clearInterval(id))`

Components receive data via signal inputs (`input.required<T>()`), not `@Input()`.

### Component Tree

```
AppComponent (shell, initializes PollingService)
└── DashboardTableComponent (main table, consumes PollingService signals)
    ├── StatusBadgeComponent (colored badge per ExecucaoStatus)
    ├── NextRunChipComponent (next run time)
    └── HistoricoPanelComponent (expandable, lazy-loaded on expand)
ErrorBannerComponent (shown when apiError signal is non-null)
```

### Services

- `StatusApiService` — raw HTTP calls to 3 endpoints: `/api/status`, `/api/condominios`, `/api/historico/:id`
- `PollingService` — owns all signals; calls `StatusApiService`; manages polling lifecycle
- `ExecucaoStatusPipe` — converts `ExecucaoStatus` string → Portuguese label

### Data Model

`ExecucaoStatus` is a union type (not an enum) with 9 states: `A_PROCESSAR`, `PROCESSAMENTO_FINALIZADO`, `ARQUIVO_BAIXADO`, `ENVIANDO_TITULOS`, `SEM_TITULOS`, `ENVIADO_SUPERLOGICA`, `FINALIZADO`, `FALHA_TEMPORARIA`, `FALHA_PERMANENTE`.

All models are defined in `src/app/models/execucao-status.model.ts`.

### Environments

- `environment.ts`: `apiBase: ''` (uses dev proxy)
- `environment.prod.ts`: `apiBase: 'http://servidor:5000'` (direct call with CORS on API)

## Constraints

- **No PII**: Never display CPF, resident names, boleto values, or account numbers
- **Signals only**: Do not introduce RxJS `Observable` chains or NgRx for state management
- **Coverage target**: ≥ 80% on services and main components (Phases 6.4)
- **Phase dependency**: `HistoricoPanelComponent` (Phase 6.3) requires the .NET API to be running

## Environment Setup

Must run inside WSL2 filesystem (e.g. `~/projetos/`), never via `/mnt/c/`. Launch Claude via:

```bash
ai-jail claude
```

LF line endings are enforced by `.gitattributes`. If files appear modified without changes, verify `git config core.autocrlf` is `false`.
