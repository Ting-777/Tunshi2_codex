"""Native Godot verification in a workspace-owned X server. No browser mockup."""
from pathlib import Path
import os, subprocess, socket, time, sys
root=Path(__file__).resolve().parents[1]; tools=root/'tools'; real=tools/'xserver/root'
xbin=real/'usr/bin/Xvfb'; patched=tools/'Xvfb-local'
data=xbin.read_bytes()
for old,new in [(b'/usr/bin\0',b'./xkb\0'),(b'/tmp',b'./tm'),(b'/var/lib/xkb',b'./xkb/cache\0')]:
 data=data.replace(old,new.ljust(len(old),b'\0'))
patched.write_bytes(data);patched.chmod(0o755)
for p in [tools/'tm/.X11-unix',tools/'xkb/cache',real/'usr/share/X11/xkb/xkb'] :p.mkdir(parents=True,exist_ok=True)
wrapper=tools/'xkb/xkbcomp'
wrapper.write_text('''#!/usr/bin/env python3
from pathlib import Path
import sys,subprocess,shutil
root=Path(__file__).resolve().parents[1]
args=[str((root/a).resolve()) if a.endswith('.xkm') and not a.startswith('/') else a for a in sys.argv[1:]]
r=subprocess.call([str(root/'xserver/root/usr/bin/xkbcomp')]+args)
for a in args:
 p=Path(a)
 if a.endswith('.xkm') and p.exists():
  for q in [root/'xkb/cache'/p.name.replace('cache',''),root/'xserver/root/usr/share/X11/xkb/xkb'/p.name]:
   if p.resolve()!=q.resolve():q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,q)
sys.exit(r)
''');wrapper.chmod(0o755)
num=next(i for i in range(100,150) if not (tools/f'tm/.X{i}-lock').exists())
env=os.environ.copy();env.update({'LD_LIBRARY_PATH':str(real/'usr/lib/x86_64-linux-gnu'),'XKB_CONFIG_ROOT':str(real/'usr/share/X11/xkb'),'DISPLAY':f'127.0.0.1:{num}','LIBGL_ALWAYS_SOFTWARE':'1','LP_NUM_THREADS':'4','GALLIUM_DRIVER':'llvmpipe'})
out=root/'builds'/os.environ.get('NATIVE_CAPTURE_ROUND','native-test' if '--test' in sys.argv else 'round-05');out.mkdir(parents=True,exist_ok=True)
with (out/'xvfb.log').open('w') as log:
 x=subprocess.Popen([str(patched),f':{num}','-screen','0','1600x900x24','-ac','-listen','tcp','-nolisten','unix','-noreset','-xkbdir',str(real/'usr/share/X11/xkb')],cwd=tools,env=env,stdout=log,stderr=subprocess.STDOUT)
 try:
  for _ in range(80):
   if x.poll() is not None:raise RuntimeError((out/'xvfb.log').read_text())
   try:
    with socket.create_connection(('127.0.0.1',6000+num),timeout=.2):break
   except OSError:time.sleep(.15)
  else:raise RuntimeError('X server did not become ready')
  pack=os.environ.get('NATIVE_CAPTURE_PACK');exe=root/'tools/Godot_v4.5.2-stable_linux.x86_64'
  cmd=[str(exe),'--path',str(root),'--rendering-method','gl_compatibility','--audio-driver','Dummy','--resolution','1600x900']
  if pack:cmd=[str(root/'tools/export-templates/linux_release.x86_64'),'--main-pack',pack,'--rendering-method','gl_compatibility','--audio-driver','Dummy','--resolution','1600x900']
  script=os.environ.get('NATIVE_CAPTURE_SCRIPT')
  if script:cmd+=['--script',script]
  if script:cmd+=['--','--fresh','--impact-output',str(out)]
  elif '--test' in sys.argv:
   cmd+=['--','--test','--test-result',str(out/'results.json')]
   if '--chapter1' in sys.argv:cmd+=['--test-chapter1']+(['--no-capture'] if '--no-shots' in sys.argv else ['--capture-output',str(out)])
   elif '--prologue' in sys.argv:cmd+=['--test-prologue']+(['--no-capture'] if '--no-shots' in sys.argv else ['--capture-output',str(out)])
   elif '--impact' in sys.argv:cmd+=['--test-impact-only']+(['--no-capture'] if '--no-shots' in sys.argv else ['--capture-output',str(out)])
   elif '--vehicle' in sys.argv:cmd+=['--test-vehicle-only']+(['--no-capture'] if '--no-shots' in sys.argv else ['--capture-output',str(out)])
   elif '--polish' in sys.argv:cmd+=['--test-polish-only','--capture-output',str(out)]
   elif '--world' in sys.argv:cmd+=(['--test-world-only','--test-native-fast'] if '--quick' in sys.argv else ['--test-world'])+['--capture-output',str(out)]
  else:cmd+=['--','--capture','--capture-output',str(out)]+(['--capture-pearl'] if '--pearl' in sys.argv else [])+(['--capture-clean'] if '--clean' in sys.argv else [])
  with (out/'runtime.log').open('w') as glog:
   run_cwd=out/'isolated' if pack else root
   run_cwd.mkdir(parents=True,exist_ok=True)
   p=subprocess.Popen(cmd,cwd=run_cwd,env=env,stdout=glog,stderr=subprocess.STDOUT)
   try:code=p.wait(timeout=600)
   except subprocess.TimeoutExpired:p.kill();p.wait();raise
  print((out/'runtime.log').read_text());sys.exit(code)
 finally:
  x.terminate()
  try:x.wait(timeout=8)
  except subprocess.TimeoutExpired:x.kill();x.wait()
  lock=tools/f'tm/.X{num}-lock'
  if lock.exists():lock.unlink()
