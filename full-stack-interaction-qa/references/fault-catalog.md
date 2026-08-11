# Fault Catalog

Declare faults before the scenario, seed them from `run_id + case_id`, inject at system boundaries, and append a `fault` event whenever one is applied.

| Fault | Purpose |
|---|---|
| `delay:api:N` | Loading state, double-submit, pending budget |
| `delay:stream:N` | Optimistic state versus pushed truth |
| `status:401` | Auth expiry and recovery |
| `status:409` | Concurrent edit conflict |
| `status:500` | Retry and rollback |
| `drop:first` | Retry correctness |
| `duplicate:request` | Idempotency |
| `reorder:responses` | Latest-intent wins |
| `drop:stream:N` | Reconnect and catch-up |
| `offline:N` | Queueing and reconciliation |
| `cancel:inflight` | Abort and side-effect policy |
| `partial:step` | Saga compensation |
| `throttle:network` | Progressive feedback under constrained network |

Keep live-backend fault runs separate from HAR/mock replay. Never inject faults into shared or production infrastructure without explicit approval.
