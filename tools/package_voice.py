"""Publish the exact active speech as a self-contained, checked source asset."""
import hashlib,json,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
out=ROOT/'assets/voice';manifest=json.loads((out/'manifest.json').read_text());active={hashlib.sha256((a+'|'+b).encode()).hexdigest()[:20] for f in (ROOT/'assets/dialogue').glob('*.json') for lines in json.loads(f.read_text()).values() for a,b in lines};manifest={k:manifest[k] for k in sorted(active)}
version=(ROOT/'VERSION').read_text().strip();name=f'Dolphin2-Voice-v{version}.zip';dest=ROOT/'builds/artifacts';dest.mkdir(parents=True,exist_ok=True);bundle=dest/name
with zipfile.ZipFile(bundle,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 z.writestr('manifest.json',json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 for key,item in manifest.items():
  p=out/(key+'.mp3');raw=p.read_bytes();assert hashlib.sha256(raw).hexdigest()==item['sha256'],key;z.writestr(p.name,raw)
sha=hashlib.sha256(bundle.read_bytes()).hexdigest();(dest/(name+'.sha256')).write_text(sha+'  '+name+'\n');metadata={'url':f'https://github.com/Ting-777/Tunshi2_codex/releases/download/v{version}/{name}','sha256':sha,'clips':len(manifest)}
(dest/'voice-bundle.json').write_text(json.dumps(metadata,indent=2)+'\n');print('VOICE_BUNDLE '+json.dumps(metadata),flush=True)
