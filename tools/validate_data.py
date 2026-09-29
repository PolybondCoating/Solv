"""PowderSolve data.json integrity check.

Run before committing any knowledge-base change:

    python tools/validate_data.py

Exits non-zero if anything is broken. Checks structure and cross-references only;
it cannot judge whether technical content is correct.
"""
import json
import sys
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data.json"
errors, warnings = [], []


def err(msg):
    errors.append(msg)


try:
    d = json.loads(DATA.read_text(encoding="utf-8"))
except Exception as e:  # noqa: BLE001
    print(f"FAIL: data.json does not parse: {e}")
    sys.exit(1)

required = ["Problems", "Diagnostic_Rules", "Diagnostic_Pathways", "Sources",
            "Cure_Profiles", "Cure_Schedules", "Cure_Product_Windows", "Conversation"]
for k in required:
    if k not in d:
        err(f"missing section: {k}")

for dup in ["Troubleshooting", "Rule_Examples1", "Colour_Variation"]:
    if dup in d:
        err(f"duplicate legacy section present: {dup}")

problems = d.get("Problems", [])
pids = [p.get("id") for p in problems]
if len(pids) != len(set(pids)):
    err("duplicate problem ids")
pid_set = set(pids)

for p in problems:
    for f in ["problem", "description", "causes", "questions", "tests", "solution", "review"]:
        if not str(p.get(f, "")).strip():
            err(f"{p.get('id')}: empty field '{f}'")

source_ids = {s.get("Source ID") for s in d.get("Sources", [])}
for r in d.get("Cure_Profiles", []):
    if r.get("Source") not in source_ids:
        err(f"{r.get('Profile ID')}: Source '{r.get('Source')}' not in Sources")
    t, m = r.get("Temperatures °F", []), r.get("Cure time min", [])
    if not t or len(t) != len(m):
        err(f"{r.get('Profile ID')}: temperature/time points mismatch")
for r in d.get("Cure_Schedules", []):
    if r.get("Source") not in source_ids:
        err(f"{r.get('Schedule ID')}: Source '{r.get('Source')}' not in Sources")
for r in d.get("Cure_Product_Windows", []):
    if r.get("Source ID") not in source_ids:
        err(f"{r.get('Product ID')}: Source ID '{r.get('Source ID')}' not in Sources")
    for pt in r.get("PMT / time points", []):
        if len(pt) != 3 or pt[1] > pt[2]:
            err(f"{r.get('Product ID')}: bad point {pt}")
        elif pt[1] == pt[2]:
            warnings.append(f"{r.get('Product ID')}: min == max at {pt[0]}°C — verify against source")

for r in d.get("Diagnostic_Rules", []):
    for i in r.get("Applies to problem IDs", []):
        if i not in pid_set:
            err(f"{r.get('Rule ID')}: unknown problem {i}")

for pw in d.get("Diagnostic_Pathways", []):
    pwid = pw.get("Pathway ID")
    nodes = pw.get("Nodes", {})
    if pw.get("Start") not in nodes:
        err(f"{pwid}: Start node '{pw.get('Start')}' missing")
    for i in pw.get("Entry problems", []):
        if i not in pid_set:
            err(f"{pwid}: unknown entry problem {i}")
    reachable, stack = set(), [pw.get("Start")]
    while stack:
        n = stack.pop()
        if n in reachable or n not in nodes:
            continue
        reachable.add(n)
        for o in nodes[n].get("options", []):
            if o.get("next"):
                stack.append(o["next"])
    for nid, node in nodes.items():
        if nid not in reachable:
            warnings.append(f"{pwid}: node '{nid}' is unreachable")
        if not node.get("options"):
            err(f"{pwid}.{nid}: no options")
        for o in node.get("options", []):
            if o.get("next") and o["next"] not in nodes:
                err(f"{pwid}.{nid}: option '{o.get('label')}' -> unknown node '{o['next']}'")
            for i in o.get("focus", []):
                if i not in pid_set:
                    err(f"{pwid}.{nid}: option '{o.get('label')}' focuses unknown problem {i}")
    # cycle check
    def has_cycle(n, seen):
        if n in seen:
            return True
        for o in nodes.get(n, {}).get("options", []):
            if o.get("next") and has_cycle(o["next"], seen | {n}):
                return True
        return False
    if has_cycle(pw.get("Start"), frozenset()):
        err(f"{pwid}: pathway contains a loop")

entry_owner = {}
for pw in d.get("Diagnostic_Pathways", []):
    for i in pw.get("Entry problems", []):
        if i in entry_owner:
            err(f"problem {i} is an entry for both {entry_owner[i]} and {pw['Pathway ID']}")
        entry_owner[i] = pw["Pathway ID"]

for w in warnings:
    print("WARN:", w)
for e in errors:
    print("FAIL:", e)
print(f"{len(problems)} problems · {len(d.get('Diagnostic_Pathways', []))} pathways · "
      f"{len(d.get('Cure_Profiles', []))} cure curves · {len(errors)} errors · {len(warnings)} warnings")
sys.exit(1 if errors else 0)
