from pathlib import Path
import io, urllib.request, json, zipfile, time, os
root=Path(__file__).resolve().parents[1];out=root/'tools/export-templates';out.mkdir(parents=True,exist_ok=True)
url='https://github.com/godotengine/godot-builds/releases/download/4.5.2-stable/Godot_v4.5.2-stable_export_templates.tpz';total=1353063159
class Remote(io.RawIOBase):
 def __init__(self):self.pos=0
 def seekable(self):return True
 def readable(self):return True
 def tell(self):return self.pos
 def seek(self,n,whence=0):self.pos=n if whence==0 else self.pos+n if whence==1 else total+n;return self.pos
 def read(self,n=-1):
  n=min(total-self.pos,n if n>=0 else total-self.pos)
  if n<=0:return b''
  start=self.pos;end=start+n-1
  for retry in range(3):
   try:
    req=urllib.request.Request(url+f'?range={start}-{end}',headers={'Range':f'bytes={start}-{end}'})
    with urllib.request.urlopen(req,timeout=55) as r:
     if r.status!=206:raise RuntimeError(f'Range unsupported: {r.status}')
     data=r.read()
    if len(data)!=n:raise RuntimeError(f'{len(data)} != {n}')
    self.pos+=n;return data
   except Exception:
    if retry==2:raise
    time.sleep(1)
with zipfile.ZipFile(Remote()) as z:
 for name in ['windows_release_x86_64.exe','linux_release.x86_64','version.txt']:
  p=out/name;info=z.getinfo('templates/'+name)
  if p.exists() and p.stat().st_size==info.file_size:continue
  print('Downloading',name,info.file_size,flush=True);p.write_bytes(z.read(info));p.chmod(0o755)
(root/'docs/GODOT-LICENSE.txt').write_bytes(urllib.request.urlopen('https://raw.githubusercontent.com/godotengine/godot/4.5.2-stable/LICENSE.txt',timeout=40).read())
print('TEMPLATES_READY',flush=True)
