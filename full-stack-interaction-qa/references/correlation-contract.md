# Correlation Contract

## Identity stack

| ID | Lifetime | Use |
|---|---|---|
| `run_id` | Complete invocation | CI or agent run |
| `scenario_id` | Named product flow | `search.latest-wins` |
| `case_id` | Fault-matrix cell | `delay-api-800` |
| `action_id` | User gesture | Click Save |
| `intent_id` | Business mutation | Idempotency and optimistic state |
| `trace_id` | Backend operation | Distributed trace and logs |
| `request_id` | HTTP exchange | Retry and response pairing |
| `stream_msg_id` | WS/SSE message | Ordering and deduplication |
| `entity_id` | Durable business entity | Order, upload, document |

Mint IDs in that order. Propagate `traceparent`, `x-run-id`, `x-scenario-id`, and `x-intent-id` only where the test environment and application contract allow it. Do not expose test headers in production without approval.

## Time

Store monotonic nanoseconds for ordering and UTC for human logs. Join on IDs. Use time only for lane-local ordering and budgets. Mark skew instead of hard-failing when client and server clocks differ.

## Graph edges

Build in this priority:

1. Explicit parent event
2. Same intent ID
3. Same trace ID
4. Same request or stream message ID
5. Same entity ID
6. Temporal proximity only when documented as an inference

## App cooperation

Prefer one centralized mutation wrapper that attaches safe correlation IDs. Expose a test-build-only frontend-state probe for the minimum stores needed by the scenario. Prefer protected non-production probe APIs over direct database access.
