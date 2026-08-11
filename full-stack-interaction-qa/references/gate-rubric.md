# Gate Rubric

## Blocking gates

- Mutating requests have the required correlation identity.
- Product state-machine transitions are legal.
- UI terminal state agrees with authoritative backend truth.
- Exactly-once flows produce no duplicate successful effect per intent.
- Older response or stream sequence never overwrites newer state.
- Optimistic state confirms or rolls back within budget.
- Cancellation follows the documented side-effect policy.
- Authentication failure does not expose or apply another user's data.
- Persisted artifacts contain no unredacted secrets.

## Warning gates

- Backend tracing unavailable in a local-only environment.
- Visual baseline differs in an intentionally dynamic case.
- Clock skew exceeds the preferred correlation window but IDs remain complete.
- A non-authoritative evidence lane is missing.

Use happy path, duplicate submit, and one delay case for pull-request smoke. Run the complete seeded fault matrix nightly or before release. Missing authoritative truth is unknown, not pass.
