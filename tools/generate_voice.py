"""Generate the authored Chinese dialogue as bundled TTS (build-time network only).

Install edge-tts==7.3.1. Game playback is fully offline and never calls a service.
Only authored fictional dialogue in assets/dialogue is synthesized.
"""
import argparse
import asyncio
import hashlib
import json
from pathlib import Path
import subprocess
import edge_tts

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/voice'
PROFILES = {
    '豚师': ('zh-CN-YunyangNeural', '-8%', '-4Hz'),
    '小朋友': ('zh-CN-XiaoxiaoNeural', '+0%', '+2Hz'),
    '攀哥': ('zh-CN-YunxiNeural', '+0%', '+0Hz'),
    '炫神': ('zh-CN-YunxiaNeural', '+7%', '+2Hz'),
    '听歌': ('zh-CN-YunjianNeural', '-4%', '+0Hz'),
}


async def main():
    # Retain certificate verification and include the host's trusted CA store
    # (needed when an enterprise proxy adds its own trusted root).
    from edge_tts.communicate import _SSL_CTX
    _SSL_CTX.load_default_certs()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--verify-only', action='store_true')
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    catalog = {}
    for source in sorted((ROOT / 'assets/dialogue').glob('*.json')):
        for name, group in json.loads(source.read_text(encoding='utf-8')).items():
            catalog[source.stem + ':' + name] = group
    lines = {hashlib.sha256((who+'|'+text).encode()).hexdigest()[:20]: (who,text)
             for group in catalog.values() for who,text in group}
    gate=asyncio.Semaphore(3)
    manifest={}

    async def generate(key, line):
        who,text=line
        role=who.split(' · ')[0]
        voice,rate,pitch=PROFILES.get(role,('zh-CN-XiaoyiNeural','+0%','+0Hz'))
        if role.startswith('老'):
            voice,rate,pitch='zh-CN-YunxiaNeural','+4%','+18Hz'
        path=OUT/(key+'.mp3')
        if not path.exists() and args.verify_only:raise ValueError('Missing voice: '+key)
        if not path.exists():
            async with gate:
                for attempt in range(3):
                    try:
                        temporary=path.with_suffix('.part')
                        await asyncio.wait_for(edge_tts.Communicate(text,voice,rate=rate,pitch=pitch).save(str(temporary)),60)
                        temporary.replace(path)
                        break
                    except Exception:
                        if attempt==2:raise
                        await asyncio.sleep(1+attempt)
        probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','json',str(path)],text=True))
        duration=float(probe['format']['duration'])
        if duration<.3 or path.stat().st_size<1000:raise ValueError('Empty voice: '+key)
        manifest[key]={'speaker':who,'text':text,'voice':voice,'rate':rate,'pitch':pitch,'duration':round(duration,3),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}

    await asyncio.gather(*(generate(key,line) for key,line in lines.items()))
    for temporary in OUT.glob('*.part'):temporary.unlink()
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'{len(manifest)} bundled Chinese lines; {sum(p.stat().st_size for p in OUT.glob("*.mp3"))} bytes')


if __name__=='__main__':asyncio.run(main())
