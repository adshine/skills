#!/usr/bin/env python3
"""Dependency-free correlation pack, state-machine, gate, and report tooling."""

import argparse
import hashlib
import json
import re
import time
import uuid
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path


SENSITIVE_KEY = re.compile(r"password|passwd|secret|token|authorization|cookie|set-cookie|cvv|card_number|pan", re.I)
MUTATING_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
IDENTITY_FIELDS = ("action_id", "intent_id", "trace_id", "request_id", "stream_msg_id", "entity_id")


def identifier(prefix):
    return f"{prefix}_{uuid.uuid4().hex}"


def utc_now():
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def read_json(path):
    return json.loads(Path(path).read_text())


def write_json(path, value):
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n")


def load_events(run_dir):
    timeline = Path(run_dir) / "timeline.jsonl"
    if not timeline.exists():
        return []
    return [json.loads(line) for line in timeline.read_text().splitlines() if line.strip()]


def redact(value):
    if isinstance(value, dict):
        return {key: ("***" if SENSITIVE_KEY.search(str(key)) else redact(item)) for key, item in value.items()}
    if isinstance(value, list):
        return [redact(item) for item in value]
    return value


def append_event(run_dir, lane, payload, identities=None, artifacts=None, severity="info", parent=None):
    root = Path(run_dir)
    manifest = read_json(root / "manifest.json")
    identities = identities or {}
    event = {
        "v": 1,
        "event_id": identifier("evt"),
        "run_id": manifest["run_id"],
        "scenario_id": manifest["scenario_id"],
        "case_id": manifest["case_id"],
        "lane": lane,
        "t_mono_ns": time.monotonic_ns(),
        "t_wall_utc": utc_now(),
        "parent_event_id": parent,
        "severity": severity,
        "payload": redact(payload),
        "artifacts": artifacts or [],
        "redacted": True,
    }
    for field in IDENTITY_FIELDS:
        event[field] = identities.get(field)
    with (root / "timeline.jsonl").open("a") as handle:
        handle.write(json.dumps(event, sort_keys=True) + "\n")
    return event


def command_init(args):
    root = Path(args.output).resolve()
    root.mkdir(parents=True, exist_ok=True)
    for name in ("frames", "har", "traces", "logs", "db", "queues", "streams", "frontend-state", "faults", "gates"):
        (root / name).mkdir(exist_ok=True)
    manifest = {
        "v": 1,
        "run_id": args.run_id or identifier("run"),
        "scenario_id": args.scenario,
        "case_id": args.case,
        "mode": args.mode,
        "created_at": utc_now(),
        "seed": args.seed or hashlib.sha256(f"{args.scenario}:{args.case}".encode()).hexdigest()[:16],
        "budgets": {"pending_ms": args.pending_budget, "truth_ms": args.truth_budget},
    }
    write_json(root / "manifest.json", manifest)
    (root / "timeline.jsonl").touch()
    print(json.dumps({"run_dir": str(root), **manifest}, indent=2))


def command_append(args):
    payload = json.loads(args.payload)
    identities = {field: getattr(args, field) for field in IDENTITY_FIELDS}
    event = append_event(args.run_dir, args.lane, payload, identities, args.artifact, args.severity, args.parent_event_id)
    print(json.dumps(event, indent=2))


def command_graph(args):
    events = load_events(args.run_dir)
    edges = []
    latest = {field: {} for field in IDENTITY_FIELDS}
    for event in events:
        if event.get("parent_event_id"):
            edges.append({"from": event["parent_event_id"], "to": event["event_id"], "rel": "parent"})
        for field in IDENTITY_FIELDS:
            value = event.get(field)
            if not value:
                continue
            if value in latest[field]:
                edges.append({"from": latest[field][value], "to": event["event_id"], "rel": f"same_{field}"})
            latest[field][value] = event["event_id"]
    graph = {"nodes": [event["event_id"] for event in events], "edges": edges}
    write_json(Path(args.run_dir) / "graph.json", graph)
    print(json.dumps({"nodes": len(graph["nodes"]), "edges": len(edges)}, indent=2))


def command_machine(args):
    machine = read_json(args.machine)
    events = load_events(args.run_dir)
    transitions = {(item["from"], item["event"]): item["to"] for item in machine["transitions"]}
    state = machine["initial"]
    history = []
    failures = []
    for event in events:
        machine_event = event.get("payload", {}).get("machine_event")
        if not machine_event:
            continue
        target = transitions.get((state, machine_event))
        if target is None:
            failures.append({"event_id": event["event_id"], "state": state, "machine_event": machine_event, "reason": "illegal transition"})
            continue
        history.append({"event_id": event["event_id"], "from": state, "event": machine_event, "to": target})
        state = target
    terminal_ok = not args.require_terminal or state in machine.get("terminal", [])
    if not terminal_ok:
        failures.append({"state": state, "reason": "non-terminal final state"})
    result = {"machine": machine["name"], "initial": machine["initial"], "final": state, "history": history, "failures": failures, "passed": not failures}
    path = Path(args.run_dir) / "gates" / f"machine-{machine['name']}.json"
    write_json(path, result)
    append_event(args.run_dir, "assert", {"machine": machine["name"], "result": "pass" if result["passed"] else "fail", "final": state, "failures": failures}, severity="info" if result["passed"] else "error")
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result["passed"] else 1)


def command_gates(args):
    root = Path(args.run_dir)
    events = load_events(root)
    gates = []

    mutating = [event for event in events if event["lane"] == "http" and (event.get("payload", {}).get("mutating") or str(event.get("payload", {}).get("method", "")).upper() in MUTATING_METHODS)]
    missing = [event["event_id"] for event in mutating if not event.get("intent_id") or (args.require_trace and not event.get("trace_id"))]
    gates.append({"id": "G1-correlation", "passed": not missing, "failures": missing})

    machine_files = sorted((root / "gates").glob("machine-*.json"))
    machine_failures = [path.name for path in machine_files if not read_json(path).get("passed")]
    gates.append({"id": "G2-machine-legal", "passed": bool(machine_files) and not machine_failures, "failures": machine_failures or ([] if machine_files else ["no machine assertion"] )})

    effects = defaultdict(list)
    for event in events:
        payload = event.get("payload", {})
        if payload.get("business_effect") and payload.get("success") and event.get("intent_id"):
            effects[event["intent_id"]].append(event["event_id"])
    duplicates = {intent: ids for intent, ids in effects.items() if len(ids) > 1}
    gates.append({"id": "G3-idempotency", "passed": not duplicates, "failures": duplicates})

    stale = [event["event_id"] for event in events if event.get("payload", {}).get("stale_applied") is True]
    gates.append({"id": "G4-stale-response", "passed": not stale, "failures": stale})

    unresolved = [event["event_id"] for event in events if event.get("payload", {}).get("optimistic_unresolved") is True]
    gates.append({"id": "G5-optimistic-hygiene", "passed": not unresolved, "failures": unresolved})

    unsafe = []
    for event in events:
        serialized = json.dumps(event.get("payload", {}), sort_keys=True)
        if re.search(r"Bearer\s+[A-Za-z0-9._-]+", serialized, re.I):
            unsafe.append(event["event_id"])
    gates.append({"id": "G6-privacy", "passed": not unsafe, "failures": unsafe})

    result = {"passed": all(gate["passed"] for gate in gates), "gates": gates}
    write_json(root / "gates" / "result.json", result)
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result["passed"] else 1)


def command_report(args):
    root = Path(args.run_dir)
    manifest = read_json(root / "manifest.json")
    events = load_events(root)
    graph = read_json(root / "graph.json") if (root / "graph.json").exists() else {"nodes": [], "edges": []}
    gates = read_json(root / "gates" / "result.json") if (root / "gates" / "result.json").exists() else {"passed": False, "gates": []}
    lanes = Counter(event["lane"] for event in events)
    lines = [
        f"# Full-Stack Interaction QA: {manifest['scenario_id']}",
        "",
        f"- Run: `{manifest['run_id']}`",
        f"- Case: `{manifest['case_id']}`",
        f"- Mode: `{manifest['mode']}`",
        f"- Verdict: `{'PASS' if gates.get('passed') else 'FAIL'}`",
        f"- Events: `{len(events)}`",
        f"- Graph edges: `{len(graph.get('edges', []))}`",
        "",
        "## Evidence lanes",
        "",
    ]
    lines.extend(f"- `{lane}`: {count}" for lane, count in sorted(lanes.items()))
    lines.extend(["", "## Gates", ""])
    lines.extend(f"- `{'PASS' if gate['passed'] else 'FAIL'}` {gate['id']}" for gate in gates.get("gates", []))
    lines.extend(["", "## Proof boundary", "", "A passing UI state is not backend proof. Use the correlated graph and authoritative durable-state lane for terminal truth.", ""])
    (root / "report.md").write_text("\n".join(lines))
    print(json.dumps({"report": str((root / 'report.md').resolve()), "passed": gates.get("passed", False)}, indent=2))


def build_parser():
    parser = argparse.ArgumentParser(description="Full-stack interaction QA correlation tooling")
    sub = parser.add_subparsers(dest="command", required=True)

    init = sub.add_parser("init-run", help="Initialize an evidence pack")
    init.add_argument("--output", required=True)
    init.add_argument("--scenario", required=True)
    init.add_argument("--case", default="happy")
    init.add_argument("--mode", choices=("live", "replay", "mock"), default="live")
    init.add_argument("--run-id")
    init.add_argument("--seed")
    init.add_argument("--pending-budget", type=int, default=10000)
    init.add_argument("--truth-budget", type=int, default=15000)
    init.set_defaults(func=command_init)

    append = sub.add_parser("append", help="Append one redacted event")
    append.add_argument("--run-dir", required=True)
    append.add_argument("--lane", required=True)
    append.add_argument("--payload", required=True, help="JSON object")
    append.add_argument("--severity", default="info")
    append.add_argument("--parent-event-id")
    append.add_argument("--artifact", action="append", default=[])
    for field in IDENTITY_FIELDS:
        append.add_argument(f"--{field.replace('_', '-')}", dest=field)
    append.set_defaults(func=command_append)

    graph = sub.add_parser("build-graph", help="Build correlation edges")
    graph.add_argument("--run-dir", required=True)
    graph.set_defaults(func=command_graph)

    machine = sub.add_parser("assert-machine", help="Assert a JSON state machine")
    machine.add_argument("--run-dir", required=True)
    machine.add_argument("--machine", required=True)
    machine.add_argument("--require-terminal", action="store_true")
    machine.set_defaults(func=command_machine)

    gates = sub.add_parser("gates", help="Run core acceptance gates")
    gates.add_argument("--run-dir", required=True)
    gates.add_argument("--require-trace", action="store_true")
    gates.set_defaults(func=command_gates)

    report = sub.add_parser("report", help="Generate Markdown summary")
    report.add_argument("--run-dir", required=True)
    report.set_defaults(func=command_report)
    return parser


def main():
    args = build_parser().parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
