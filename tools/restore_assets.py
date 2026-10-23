"""Restore the original font and repository speech bundle; no chat attachment needed."""
from pathlib import Path
import hashlib
import urllib.request
import json,re,zipfile,io

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


# The published speech bundle is pinned independently from build-time TTS.
voice_dir = root / 'assets/voice'
metadata_path = root / 'VOICE-BUNDLE.json'
if metadata_path.exists():
    metadata = json.loads(metadata_path.read_text())
    voice_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = voice_dir / 'manifest.json'
    present = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    required = {hashlib.sha256((a+'|'+b).encode()).hexdigest()[:20] for source in (root/'assets/dialogue').glob('*.json') for lines in json.loads(source.read_text()).values() for a,b in lines}
    complete = all(k in present and (voice_dir/(k+'.mp3')).exists() and hashlib.sha256((voice_dir/(k+'.mp3')).read_bytes()).hexdigest()==present[k]['sha256'] for k in required)
    if complete:
        print('Current speech already present and verified.')
    else:
        with urllib.request.urlopen(metadata['url'], timeout=60) as response:
            bundle = response.read()
        if hashlib.sha256(bundle).hexdigest()!=metadata['sha256']:
            raise SystemExit('Published voice bundle SHA256 mismatch.')
        with zipfile.ZipFile(io.BytesIO(bundle)) as archive:
            names=archive.namelist()
            if len(names)!=len(set(names)) or any(n!='manifest.json' and not re.fullmatch(r'[a-f0-9]{20}\.mp3',n) for n in names):
                raise SystemExit('Unsafe voice bundle inventory.')
            manifest=json.loads(archive.read('manifest.json'))
            if len(manifest)!=metadata['clips']:
                raise SystemExit('Voice bundle count mismatch.')
            for key,item in manifest.items():
                raw=archive.read(key+'.mp3')
                if hashlib.sha256(raw).hexdigest()!=item['sha256']:
                    raise SystemExit('Voice clip SHA256 mismatch.')
                (voice_dir/(key+'.mp3')).write_bytes(raw)
            manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
        print(f'Restored {len(manifest)} verified offline voice clips.')
else:
    print('Speech bundle not yet pinned; build-time tools/generate_voice.py generates missing dialogue.')
