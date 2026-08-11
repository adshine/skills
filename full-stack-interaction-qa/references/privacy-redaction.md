# Privacy and Redaction

Apply `capture -> redact -> persist`.

- Never persist passwords, access tokens, authorization headers, cookies, session IDs, CVV, or payment card numbers.
- Use synthetic fixtures for emails, phone numbers, names, and addresses; otherwise hash them.
- Store upload size, digest, and content type rather than file contents.
- Persist only allowlisted headers such as `content-type`, `traceparent`, `x-request-id`, and `x-intent-id`.
- Blur or omit frames containing personal information.
- Keep any reversible redaction map local, encrypted, and outside shared reports.
- Do not read production payloads, logs, or databases without explicit authorization.

The bundled append command recursively replaces values under sensitive key names with `***`. Adapters must redact raw captures before calling it.
