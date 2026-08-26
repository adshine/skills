---
name: full-stack-interaction-qa
description: Diagnose and verify backend-dependent product interactions by correlating user actions with HTTP, WebSocket or SSE, distributed traces, logs, and database or queue transitions—plus deterministic faults and state-machine assertions. Rendered UI and frontend state are evidence lanes only when those backend lanes exist; they are not pick-triggers alone. Use for save, upload, checkout, payment-like, authentication, optimistic UI, retry, cancellation, offline/reconnect, eventual-consistency, stale-response, duplicate-effect, race-condition, rollback, and partial-failure flows where UI must agree with backend truth; pick for search only when HTTP/index/backend lanes are in scope. Not for click/hover/focus feel (interaction-feel-qa), settled 2D layout pixels (measured-visual-qa), CSS motion/flicker/easing (motion-visual-qa), CLI/fixture-filesystem contracts (cli-fs-qa), shipped-vs-source UI without backend (source-fidelity-qa), UI-only search without backend lanes, or 3D scene graphs (spatial-runtime-qa, not built). Missing HTTP/DB/trace evidence is a gap, never Pass; backend: none is never Pass.
---

# Full-Stack Interaction QA

Treat UI frames as one evidence lane, not the source of backend truth. Build a correlation graph for each scenario, assert its product state machine, and run deterministic fault cases before declaring an interaction correct.

## Non-goals (fence)

Do not pick this skill for:

| Concern | Skill |
|---|---|
| Click, drag, hover, focus feel, hit slop, light-dismiss | `interaction-feel-qa` |
| Settled 2D layout / painted geometry | `measured-visual-qa` |
| CSS motion, flicker, easing, scroll/view timelines | `motion-visual-qa` |
| CLI exit codes, stdout/stderr, fixture FS, lockfile hashes | `cli-fs-qa` |
| Shipped UI vs named frozen design/token/spec source | `source-fidelity-qa` |
| Three.js / WebGL / canvas scene graph | `spatial-runtime-qa` (reserved, not shipped) |

Missing HTTP, database/queue, or trace evidence is an **evidence gap**, never Pass. A scenario marked `backend: none` is never Pass under this skill—route pure UI/CLI work elsewhere.

## Required workflow

1. Define the scenario contract.
   - Name the user intent, expected terminal truth, allowed intermediate states, latency budgets, cancellation policy, retry policy, and exactly-once requirements.
   - Select or adapt a machine from `references/machine-*.json`.
2. Define evidence access before running.
   - Identify browser, frontend-state, HTTP, trace/log, database/cache/queue, stream, and visual lanes that are available.
   - State unavailable lanes as evidence gaps. Never infer a database write from a success toast.
3. Initialize a correlation pack.
   - Run `scripts/fsqa.py init-run` outside the repository unless committed fixtures are requested.
   - Mint `run_id`, `scenario_id`, and `case_id` before interaction.
4. Propagate identity.
   - Mint one `action_id` per gesture and one `intent_id` per business mutation.
   - Send W3C `traceparent` plus safe `x-run-id`, `x-scenario-id`, and `x-intent-id` headers when app access permits.
   - Reuse the intent as an idempotency key when the API contract supports it.
5. Capture all available lanes.
   - Append events through `scripts/fsqa.py append`; it redacts sensitive keys before persistence.
   - Record actions before gestures, HTTP start and completion, frontend optimistic and reconciled states, trace/log IDs, durable side effects, stream messages, faults, assertions, and visual artifact paths.
6. Run the happy path once.
   - Verify correlation coverage and terminal truth before adding faults.
7. Run a declared, seeded fault matrix.
   - Read `references/fault-catalog.md`.
   - Start with delay, drop-first, duplicate-submit, stale response, cancellation, offline/reconnect, and one partial failure relevant to the flow.
8. Build the graph and assert the machine.
   - Run `scripts/fsqa.py build-graph` and `scripts/fsqa.py assert-machine`.
   - Join primarily by `intent_id`, then `trace_id`, `request_id`, stream IDs, and entity IDs. Use temporal proximity only as a last resort.
9. Run gates and generate the report.
   - Run `scripts/fsqa.py gates` followed by `scripts/fsqa.py report`.
   - Attach `measured-visual-qa` artifacts when a failed assertion has a UI shape.
10. Report proof boundaries.
   - Separate browser behavior, request completion, backend trace, durable write, async worker completion, stream delivery, and final UI reconciliation.

## Correlation rules

- Store monotonic nanoseconds for ordering and UTC wall time for people.
- Never join solely on wall time; clocks drift.
- Require `intent_id` for mutating actions and durable effects.
- Require `trace_id` for backend work when tracing is available.
- Assign monotonically increasing sequence IDs to search requests and stream messages.
- Hash large or sensitive bodies; persist only allowed fields.
- Record every injected fault as an event before observing its consequences.
- Keep live-backend runs separate from HAR or mocked replay runs.

## Acceptance principles

- UI terminal state must agree with the authoritative backend state within the scenario budget.
- One intent must not create duplicate effects when exactly-once behavior is required.
- Older responses must not overwrite newer intent or query state.
- Optimistic state must confirm or roll back within budget.
- Cancellation must obey the documented server-side effect policy.
- Authentication expiry must recover or fail safely without cross-user data exposure.
- Every retry must follow the declared intent/idempotency policy.
- Every failure must link to correlated events and artifacts, not only prose.
- Sensitive data must be redacted before artifact persistence.

## Escalation boundaries

- Do not access production databases, logs, queues, traces, or customer payloads unless the user explicitly places them in scope and authorization is clear.
- Prefer test probe APIs, synthetic fixtures, test accounts, and non-production environments.
- Confirm before injecting faults into shared or production infrastructure.
- Do not add test-only backend endpoints to production builds without explicit approval and environment guards.
- Treat missing evidence as unknown, not pass.
- Do not clear click-feel, static layout, CSS motion, or CLI/fs gates from this skill—even when backend lanes are green.

## Resources

- Run `scripts/fsqa.py --help` for the correlation-pack commands.
- Read `references/correlation-contract.md` before adding app instrumentation or adapters.
- Read `references/artifact-schema.json` when emitting events from another language.
- Read `references/machine-dsl.md` before defining a new product flow.
- Read `references/fault-catalog.md` before selecting fault cases.
- Read `references/gate-rubric.md` when choosing blocking versus warning gates.
- Read `references/privacy-redaction.md` before capturing network bodies, frames, logs, or state.
- Reuse `references/machine-save.json`, `machine-upload.json`, `machine-search.json`, or `machine-payment.json` as starting points.
