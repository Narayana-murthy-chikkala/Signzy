# Intelligent Vendor Routing Platform

Modern platforms often depend on multiple third-party vendors for the same
capability - KYC verification, OCR, document validation, and so on - each
differing in cost, latency, success rate, rate limits, error rate,
availability, and supported features. This project exposes **one unified API**
that decides which vendor to call for each request, based on configurable
routing rules and live performance signals, so the client never needs to know
which vendor actually served it.

No real vendor APIs are called — vendors are simulated with randomized
latency/success/failure/timeout outcomes so the routing and failover logic
can be exercised end-to-end without external dependencies.

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS + React Router + Recharts
- **Backend**: Node.js + Express.js (MVC, Strategy design pattern for routing)
- **Database**: MongoDB + Mongoose (MongoDB Atlas in production; local Mongo for dev)
- **API Testing**: Postman (`server/postman_collection.json`)

## Project Structure

```
client/src/
  components/   shared UI (Layout, tables, cards, modal, badges, progress bars)
  pages/        Dashboard, Vendors, RouteTester, Metrics, Logs, Health, AIRuleGenerator
  services/     axios API client
  hooks/        useMetrics, useLogs, useHealth
  context/      AppContext (shared vendor list)
  utils/        formatting helpers

server/
  config/       db connection, runtime constants
  controllers/  request handlers (vendor, routing, metrics, logs, health, ai-rule, routing-config, advice)
  models/       Vendor, RoutingLog, RoutingConfig (Mongoose schemas)
  routes/       Express routers
  middleware/   error handler (normalizes Mongoose errors to clean 4xx responses)
  services/     vendorSimulator, metricsService, loggingService, routingEngine, strategyAdvisor, fallbackAdvisor
  strategies/   priority / weighted / roundRobin / lowestLatency / lowestCost / healthBased / failover / featureBased
  utils/        asyncHandler, ApiError, filterVendors, rateLimiter, computeAvailability, fileLogger, aiRuleGenerator, seed
  logs/         routing.log audit trail (flat file, gitignored)
  tests/        Jest + Supertest (unit tests for strategies/advisors, integration tests against an in-memory Mongo)
```

## Setup

Prerequisites: Node.js 18+, a MongoDB instance (local `mongod`, or a MongoDB
Atlas cluster - either works, just point `MONGO_URI` at it).

```bash
npm run install:all      # installs server + client dependencies
npm run seed             # seeds 5 sample vendors into MongoDB
npm run dev              # runs backend (:5000) and frontend (:5173) together
```

Environment variables live in `server/.env` and `client/.env` (see the
matching `.env.example` files).

```bash
cd server && npm test    # runs the automated test suite (in-memory Mongo, no external DB needed)
```

## Vendor Configuration

Each vendor has: `name`, `priority`, `weight`, `costPerRequest`, `timeoutMs`,
`rateLimitPerMinute`, `supportedFeatures`, `healthStatus`, `isActive`, plus
tracked metrics (latency, success rate, error rate, availability). Multiple
vendors can be registered for the same capability - the router decides which
one actually handles a given request.

## Routing Strategies

Eight strategies are implemented (the brief asked for at least three):
`priority`, `weighted`, `roundRobin`, `lowestLatency`, `lowestCost`,
`healthBased`, `failover`, `featureBased` — one file per strategy under
`server/strategies/`, each exposing a `rank(vendors, context)` function
(Strategy design pattern; see `server/strategies/index.js` for the registry).

Before ranking, vendors are filtered out if they are: down, unhealthy, rate
limited, missing the requested capability, or over the latency threshold
(`server/utils/filterVendors.js`). A vendor is also auto-flagged unhealthy if
its rolling error rate crosses a configurable threshold after enough
requests (a circuit breaker, in `metricsService.js`). If the selected
vendor's simulated call fails, times out, or errors, the engine automatically
retries the next-best vendor from the ranked list until one succeeds or all
are exhausted (`server/services/routingEngine.js`).

`strategy` is optional on `/route` - if omitted, `requirements.preferLowCost`
picks `lowestCost`, otherwise it defaults to `priority`.

## API Reference

| Method | Route                    | Purpose                                                     |
|--------|--------------------------|---------------------------------------------------------------|
| POST   | `/vendors`               | Register a vendor                                             |
| GET    | `/vendors`               | List vendors                                                   |
| PUT    | `/vendors/:id`           | Update a vendor                                                |
| DELETE | `/vendors/:id`           | Delete a vendor                                                |
| POST   | `/route`                 | Route a request (see shape below)                              |
| GET    | `/vendor-metrics`        | Per-vendor + aggregate metrics                                 |
| GET    | `/routing-logs`          | Paginated/filterable routing decision logs                     |
| GET    | `/health`                | Server + DB + vendor health snapshot                           |
| POST   | `/ai-rule-generator`     | Convert plain-English rule text into routing config JSON (bonus) |
| POST   | `/routing-configs`       | Save a generated config and apply its weights to real vendors  |
| GET    | `/routing-configs`       | List saved routing configs                                      |
| GET    | `/strategy-recommendation` | Recommend the best routing strategy from current vendor signals (bonus) |
| GET    | `/fallback-suggestions`  | Suggest a per-capability fallback order from real routing history (bonus) |

### `POST /route` request

```json
{
  "capability": "PAN_VERIFICATION",
  "payload": { "pan": "ABCDE1234F", "name": "Rahul Sharma" },
  "requirements": { "maxLatencyMs": 2000, "preferLowCost": true }
}
```

`strategy` may be supplied explicitly instead of/alongside `requirements`.
`conditions` (as produced by the AI Rule Generator) can also be passed to
override ranking when a vendor breaches a threshold.

### Standard response (identical envelope regardless of vendor)

```json
{
  "status": "SUCCESS",
  "vendorUsed": "VendorB",
  "routingReason": "VendorB selected because VendorA crossed latency threshold",
  "latencyMs": 850,
  "cost": 1.2,
  "response": { "panStatus": "VALID", "nameMatch": true },
  "requestId": "...",
  "failoverHistory": [ ... ]
}
```

The outer envelope (`status`, `vendorUsed`, `routingReason`, `latencyMs`,
`cost`, `response`) is identical no matter which vendor or capability was
used - that's the whole point of the router. What differs is the *inner*
shape of `response`, which is capability-specific
(`server/utils/capabilityResponses.js`) so the simulation feels like it's
actually calling a real KYC/OCR/SMS/payment/document API rather than
returning one generic envelope for everything:

| Capability            | Example payload                                                          | Example `response`                                                  |
|------------------------|---------------------------------------------------------------------------|------------------------------------------------------------------------|
| `PAN_VERIFICATION`     | `{ "pan": "ABCDE1234F", "name": "Rahul Sharma" }`                        | `{ "panStatus": "VALID", "nameMatch": true, "pan": "ABCDE1234F" }`     |
| `OCR`                  | `{ "documentUrl": "...", "documentType": "INVOICE" }`                    | `{ "extractedText": "...", "confidence": 0.93, "fieldsDetected": {...} }` |
| `SMS`                  | `{ "to": "+919876543210", "message": "Your OTP is 482913" }`             | `{ "messageId": "sms_x1y2z3", "deliveryStatus": "DELIVERED", "to": "...", "deliveredAt": "..." }` |
| `PAYMENT_PROCESSING`   | `{ "amount": 999.0, "currency": "INR", "cardLast4": "4242" }`            | `{ "transactionId": "txn_x1y2z3", "paymentStatus": "CAPTURED", "amountCharged": 999.0, "currency": "INR" }` |
| `DOCUMENT_VALIDATION`  | `{ "documentType": "CONTRACT", "documentUrl": "..." }`                   | `{ "validationStatus": "VALID", "documentType": "CONTRACT", "issuesFound": [] }` |

Any other capability string falls back to a generic `{ message, payload }`
echo shape, so custom/unregistered capabilities don't break. The Route
Tester page auto-fills the matching example payload when you pick a
capability from its dropdown.

## Agentic AI

- **Generate routing config from plain English** — `server/utils/aiRuleGenerator.js`,
  a regex-based parser (no external LLM call) that turns sentences like
  *"Use Vendor A for 70% traffic, Vendor B for 30%, but switch to Vendor C if
  latency crosses 2 seconds or error rate is above 5%."* into structured
  weights + conditions, saveable via `/routing-configs` (which also applies
  the weights to real vendor documents).
- **Explain why a vendor was selected** — every `/route` response includes a
  `routingReason` field.
- **Detect unhealthy vendors from metrics** — an automatic circuit breaker in
  `metricsService.js` flags a vendor unhealthy once its rolling error rate
  crosses a threshold, excluding it from further routing.
- **Recommend the best routing strategy** — `GET /strategy-recommendation`
  analyzes vendor latency/cost/health spread and returns a recommended
  strategy with reasoning.
- **Suggest fallback rules** — `GET /fallback-suggestions` aggregates real
  routing-log history per capability and suggests a reliability-ordered
  fallback chain.

All of the above are visible together on the **AI Rule Generator** dashboard page.
