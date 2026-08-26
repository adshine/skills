---
name: cli-fs-qa
description: Verify CLI invocation, exit codes, stdout/stderr, isolated fixture filesystems, lockfile hashes (for example hui.lock), and doctor findings when the authoritative truth is the fixture filesystem—not a spinner or toast. Use when a user asks to test a CLI, scaffold, doctor, lockfile, or offline filesystem contract. Not for HTTP/DB/trace (full-stack-interaction-qa), settled layout pixels (measured-visual-qa), CSS motion (motion-visual-qa), click feel (interaction-feel-qa), shipped-vs-source UI (source-fidelity-qa), or 3D (spatial-runtime-qa, not built). Do not require HTTP, DB, or distributed trace evidence.
---

# CLI / Filesystem QA

Authoritative truth is the **isolated fixture filesystem** plus process exit code and streams. A UI spinner, progress line, or success toast is never sufficient.

## When to pick

- CLI invocation and flags
- Exit code contracts
- stdout / stderr shape and stability
- Isolated fixture directories and generated files
- Lockfile hashes (for example `hui.lock`)
- `doctor` / environment findings written to disk or streams

## Pointer-out

| Concern | Skill |
|---|---|
| HTTP, WebSocket, traces, DB/queue | `full-stack-interaction-qa` |
| Settled 2D layout | `measured-visual-qa` |
| Motion / flicker | `motion-visual-qa` |
| Click/hover/focus feel | `interaction-feel-qa` |
| Shipped UI vs named design source | `source-fidelity-qa` |
| 3D scene graph | `spatial-runtime-qa` (reserved, not shipped) |

## Required workflow

1. Define the command contract: argv, cwd, env, expected exit code, stream assertions, and filesystem effects.
2. Build an isolated fixture directory; never treat the developer's dirty workspace as proof.
3. Run the CLI with captured stdout, stderr, and exit code.
4. Diff the fixture tree against the expected manifest (paths, contents, modes when in scope).
5. Hash lockfiles and other pinned artifacts; compare to golden hashes when provided.
6. Collect doctor findings from their declared sink (file and/or stderr); assert codes/messages from the contract.
7. Report command, exit code, stream excerpts, filesystem diff, hashes, and verdict.

## Acceptance gates

Pass only when all applicable gates hold:

- Exit code matches the contract.
- stdout/stderr match required lines and omit forbidden ones (within declared volatility rules).
- Fixture filesystem matches the expected manifest; unexpected files are Fail unless explicitly allowed.
- Lockfile (or equivalent) hash matches the golden when hashing is in scope.
- Doctor findings match the contract when doctor is in scope.
- Missing HTTP/DB/trace lanes are **not** gaps for this skill—do not require them and do not send CLI-only work to FSQA.

## Anti-patterns

- Declaring Pass from a spinner, progress UI, or “Done” line without filesystem proof.
- Requiring backend traces for a pure CLI/fs contract.
- Mutating shared non-fixture directories and calling that isolation.
- Ignoring stderr warnings that the contract marks as blocking.
- Routing CLI failures into `full-stack-interaction-qa`.

## Resources

- Keep fixtures and goldens outside the skill unless the user requests committed fixtures.
- Hand backend-dependent CLIs that must prove HTTP/DB effects to `full-stack-interaction-qa` for those effects only; keep filesystem assertions here.
