# State Machine DSL

Machines are dependency-free JSON:

```json
{
  "name": "save",
  "initial": "idle",
  "terminal": ["saved", "failed", "cancelled"],
  "transitions": [
    {"from": "idle", "event": "SUBMIT", "to": "saving"},
    {"from": "saving", "event": "SAVE_OK", "to": "saved"},
    {"from": "saving", "event": "SAVE_FAIL", "to": "failed"}
  ]
}
```

Emit machine events in an event payload:

```json
{"machine_event": "SAVE_OK"}
```

The assertor walks events in timeline order. Any missing transition is illegal. Use explicit states for optimistic, retrying, reconciling, rolled-back, and unknown outcomes when product behavior distinguishes them.

State machines establish legal order. Add cross-lane gates for durable truth, idempotency, staleness, cancellation, privacy, and latency budgets.
