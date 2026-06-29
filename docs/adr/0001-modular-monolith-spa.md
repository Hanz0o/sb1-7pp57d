# ADR 0001 — Modular monolith SPA with mock supply adapters

- **Status:** Accepted
- **Context:** The OTA spec targets event-driven services on Kubernetes (NestJS,
  Postgres, Redis, OpenSearch, Kafka, Terraform). The delivery environment is a
  single Vite + React + TypeScript app — no server runtime, datastore, or broker
  is available to run or deploy.
- **Decision:** Ship the consumer surface as a **modular-monolith SPA**. Keep all
  business logic in a framework-free `domain/` layer (money, FX, pricing,
  cancellation policy, ledger, catalog adapters) with React confined to
  `features/`, `components/`, and `state/`. Every external dependency sits behind
  an interface (`FxProvider`, the catalog adapters) with a mock implementation.
- **Consequences:**
  - The platform is demoable end-to-end immediately (spec §8, §14).
  - `domain/` has zero React imports, so it lifts into NestJS bounded contexts
    (`pricing`, `cart-order`, `booking-orchestrator`) without rewrites.
  - Trade-off: no real persistence, network, or cross-service eventing — state is
    in-memory and resets on reload. Acceptable for a phase-1/2 demonstrator.
