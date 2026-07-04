# AI Usage Disclosure

This project was built with **Claude Code** (Anthropic's CLI agent, using the
Claude Sonnet 5 model) as an AI pair-programmer throughout the entire
development process. This document is an honest account of how it was used,
what it produced, what a human directed/reviewed, and how outputs were
verified rather than trusted blindly.

There are two separate things worth distinguishing, and this file covers both:

1. **AI used to *build* this project** (this section) — Claude Code as a
   development tool.
2. **AI-branded *features* inside the product itself** (the "Agentic AI"
   bonus - AI Rule Generator, Strategy Recommendation, Fallback Suggestions).
   These are **rule-based/regex and statistical heuristics, not calls to any
   external LLM API** - see [Agentic AI Features](#agentic-ai-features-in-the-product) below. Conflating the
   two would be misleading, so they're addressed separately.

## AI used to build this project

**Tool**: Claude Code (claude-sonnet-5), interactive CLI sessions.

**What it was used for**: essentially the full development lifecycle -
project scaffolding, backend implementation (Express/Mongoose, the routing
engine, all 8 routing strategies, failover logic, metrics/availability
tracking, rate limiting), the React frontend (all pages/components), the
Jest/Supertest test suite, debugging, and iterative bug fixes.

**What a human (the developer) directed**:
- Supplied the original assignment brief and all functional requirements.
- Made every scope decision - what to build, what to explicitly defer (e.g.
  authentication was proposed by the AI's own audit and deliberately *not*
  added, since it wasn't part of the brief).
- Caught and reported real defects during manual testing that prompted
  fixes - e.g. a stale `Availability` metric that didn't reflect a vendor's
  current down/unhealthy state, and the AI Rule Generator's "Save & Apply"
  button being disabled for priority-style rules with no percentages.
- Reviewed generated code and explicitly requested a strict, line-by-line
  self-audit against the assignment brief at multiple points in the project.
- Approved infrastructure changes (MongoDB Atlas migration, GitHub push).

**How outputs were verified, not just generated**:
- An automated test suite (53 Jest/Supertest tests) was written alongside
  the implementation, run after every change, and expanded specifically to
  cover bugs as they were found (e.g. a concurrency test that fires 6
  simultaneous requests at a rate-limited vendor to prove the limiter holds
  under a true burst, not just sequential calls).
- Every feature was exercised live against the running application (curl
  and a real, install-free browser session via Playwright/Chrome) rather
  than accepted on the basis of code review alone - screenshots and console-error
  checks were used to confirm the UI actually rendered and behaved as intended.
- Several self-corrections happened *during* verification: for example, an
  initial rate-limiter fix worked correctly in isolation but was found (via a
  concurrent-burst test) to interact badly with a newly-added vendor cache,
  and was redesigned to use an atomic database operation instead of a
  JS-level check before being accepted as done.

**What this means for code review**: every file in this repository was
written by Claude Code, under direct human instruction and iterative
correction. Nothing here should be assumed correct purely because an AI
wrote it - the test suite and the verification steps above are the actual
evidence of correctness, and are included in the repository for that reason.

## Agentic AI Features in the product

The assignment's bonus section asks for an AI agent that can recommend a
routing strategy, explain vendor selections, detect unhealthy vendors, and
generate routing config from plain English. All four are implemented -
**deliberately without calling any external LLM API** - as transparent,
inspectable logic:

| Feature | File | How it actually works |
|---|---|---|
| Generate routing config from plain English | `server/utils/aiRuleGenerator.js` | Regex-based extraction of vendor/percentage pairs and `metric operator value` conditions (handles synonyms like "crosses", "exceeds", "is above", and compound "X or Y" clauses) |
| Explain why a vendor was selected | `server/utils/routingReason.js` | A `routingReason` string is generated per strategy on every `/route` call (e.g. `"Highest priority (5) among eligible vendors"`) |
| Detect unhealthy vendors from metrics | `server/services/metricsService.js` | An automatic circuit breaker flips a vendor to `unhealthy` once its rolling error rate crosses a configurable threshold over enough requests |
| Recommend the best routing strategy | `server/services/strategyAdvisor.js` | Compares live latency/cost/health *spread* across vendors and picks the strategy that best exploits whichever difference is largest |
| Suggest fallback rules | `server/services/fallbackAdvisor.js` | Aggregates real `RoutingLog` history per capability and ranks vendors by measured reliability |

This choice was made for the same reason the vendor simulator doesn't call
real vendor APIs: the point of a college assignment routing platform is to
demonstrate the *routing/decision logic* itself, transparently and
deterministically, not to depend on a third-party model's availability, cost,
or non-determinism for a core grading criterion. It also means every one of
these "AI" behaviors has a corresponding unit test with a deterministic,
checkable expected output - something that would be much harder to assert
confidently against a real LLM's output.
