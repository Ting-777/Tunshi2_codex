from pathlib import Path
import shutil,zipfile,struct
r=Path(__file__).resolve().parents[1];out=r/'builds/windows';v=r/'docs/verification'
for p in (r/'launchers').glob('*.cmd'):shutil.copyfile(p,out/p.name)
shutil.copyfile(r/'README.md',out/'README.md');shutil.copyfile(v/'TEST-REPORT.md',out/'TEST-REPORT.md')
preview=out/'Screenshots';preview.mkdir(exist_ok=True)
for p in v.glob('*.png'):shutil.copyfile(p,preview/p.name)
b=(out/'Dolphin2.exe').read_bytes();offset=struct.unpack_from('<I',b,0x3c)[0]
assert b[:2]==b'MZ' and b[offset:offset+4]==b'PE\0\0' and struct.unpack_from('<H',b,offset+4)[0]==0x8664
assert (out/'Dolphin2.pck').read_bytes()[:4]==b'GDPC'
artifact=r/'builds/artifacts/dolphin2-shanghai-toon-windows-v031.zip'
with zipfile.ZipFile(artifact,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in out.rglob('*'):
  if p.is_file() and not any(part.startswith('.') for part in p.relative_to(out).parts):z.write(p,'Dolphin2-Shanghai-Toon/'+str(p.relative_to(out)))
with zipfile.ZipFile(artifact) as z:assert z.testzip() is None
print(artifact,artifact.stat().st_size)
