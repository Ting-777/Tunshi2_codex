from pathlib import Path
import zipfile
r=Path(__file__).resolve().parents[1];out=r/'builds/artifacts/dolphin2-shanghai-toon-source-v031.zip';out.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for d in ['scripts','scenes','shaders','assets','docs','tests','launchers','reference']:
  for p in (r/d).rglob('*'):
   if p.is_file() and p.suffix not in ['.import','.pyc']:z.write(p,'dolphin2-shanghai-toon/'+str(p.relative_to(r)))
 for name in ['project.godot','export_presets.cfg','AGENTS.md','README.md','.gitignore','SOURCE-MANIFEST.json']:
  if (r/name).exists():z.write(r/name,'dolphin2-shanghai-toon/'+name)
 for name in ['extract_dolphin.mjs','package_source.py','package_windows.py','capture.py','capture_impact.gd','fetch_templates.py','verify_source.py','restore_assets.py']:
  if (r/'tools'/name).exists():z.write(r/'tools'/name,'dolphin2-shanghai-toon/tools/'+name)
print(out,out.stat().st_size)
