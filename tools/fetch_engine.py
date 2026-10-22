"""Fetch Godot 4.5.2 from the official release and verify SHA512 before use."""
import argparse
import hashlib
from pathlib import Path
import platform
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://github.com/godotengine/godot-builds/releases/download/4.5.2-stable/'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--templates', action='store_true')
    args = parser.parse_args()
    with urllib.request.urlopen(BASE + 'SHA512-SUMS.txt', timeout=60) as response:
        sums = {line.split()[-1].lstrip('*'): line.split()[0]
                for line in response.read().decode().splitlines() if len(line.split()) == 2}
    engine = ('Godot_v4.5.2-stable_win64.exe.zip' if platform.system() == 'Windows'
              else 'Godot_v4.5.2-stable_linux.x86_64.zip')
    names = [engine] + (['Godot_v4.5.2-stable_export_templates.tpz'] if args.templates else [])
    for name in names:
        path = ROOT / 'tools' / name
        valid = False
        if path.exists():
            with path.open('rb') as stream:valid = hashlib.file_digest(stream, 'sha512').hexdigest() == sums[name]
        if not valid:
            print('Downloading ' + name, flush=True)
            urllib.request.urlretrieve(BASE + name, path)
        with path.open('rb') as stream:
            if hashlib.file_digest(stream, 'sha512').hexdigest() != sums[name]:raise ValueError('Official SHA512 mismatch: ' + name)
        with zipfile.ZipFile(path) as archive:
            if name.endswith('.tpz'):
                dest = ROOT / 'tools/export-templates';dest.mkdir(parents=True, exist_ok=True)
                for member in ['windows_release_x86_64.exe', 'linux_release.x86_64', 'version.txt']:
                    output = dest / member;output.write_bytes(archive.read('templates/' + member));output.chmod(0o755)
            else:
                dest = ROOT / 'tools/godot-4.5.2';dest.mkdir(parents=True, exist_ok=True);archive.extractall(dest)
                for output in dest.iterdir():
                    if output.is_file():output.chmod(0o755)
                (dest / '_sc_').touch()
    print('Godot 4.5.2 verified and ready.', flush=True)


if __name__ == '__main__':main()
