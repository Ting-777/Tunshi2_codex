"""Verify portable source and original assets against the migration manifest."""
from pathlib import Path
import hashlib
import json
import sys

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'SOURCE-MANIFEST.json').read_text())
failures = []
for name, expected in manifest['files'].items():
    path = root / name
    if not path.is_file():
        failures.append(name + ': missing')
        continue
    data = path.read_bytes()
    if len(data) != expected['bytes'] or hashlib.sha256(data).hexdigest() != expected['sha256']:
        failures.append(name + ': differs from migration checkpoint')
print(f"Migration checkpoint: {manifest['version']}; checked {len(manifest['files'])} files")
for failure in failures:
    print(failure)
if failures:
    print('Intentional later edits will differ; inspect git diff before updating the manifest.')
sys.exit(bool(failures))
