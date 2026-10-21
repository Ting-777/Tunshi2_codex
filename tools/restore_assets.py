"""Restore the original licensed font from its official source; no chat attachment needed."""
from pathlib import Path
import hashlib
import urllib.request

root = Path(__file__).resolve().parents[1]
target = root / 'assets/fonts/Chinese.otf'
expected = 'b5f0d1a190a7f9b43c310a8850630af12553df32c4c050543f9059732d9b4c0a'
url = 'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Bold.otf'
if target.is_file() and hashlib.sha256(target.read_bytes()).hexdigest() == expected:
    print('Original font already present.')
else:
    with urllib.request.urlopen(url, timeout=60) as response:
        data = response.read()
    if hashlib.sha256(data).hexdigest() != expected:
        raise SystemExit('Official font differs from the preserved version; refusing replacement.')
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_suffix('.download')
    temporary.write_bytes(data)
    temporary.replace(target)
    print('Original Noto Sans CJK SC Bold font restored; SHA256 verified.')
