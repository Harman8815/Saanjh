"""Trace JSX expression parens in the guests page to find the imbalance."""
import pathlib
import re

path = pathlib.Path("frontend/app/dashboard/guests/page.tsx")
lines = path.read_text(encoding="utf-8").splitlines()

depth = 0
events = []
for i, line in enumerate(lines, start=1):
    stripped = re.sub(r"'[^']*'", "''", line)
    stripped = re.sub(r'"[^"]*"', '""', stripped)
    opens = stripped.count("(?(")
    # Simpler: count raw parens on code, but skip JSX text by only counting
    # lines that contain JSX expression delimiters or arrow functions.
    o = len(re.findall(r"\(", stripped))
    c = len(re.findall(r"\)", stripped))
    before = depth
    depth += o - c
    if o or c:
        events.append((before, depth, i, o, c, line.strip()[:60]))

for before, after, i, o, c, text in events:
    print(f"L{i:4} {before}->{after} (o{o} c{c})  {text}")
print(f"\nfinal depth: {depth}")
