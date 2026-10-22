"""Package a tested PCK with the official Windows runtime, never screenshots."""
import argparse
import hashlib
from pathlib import Path
import shutil
import struct
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pack', type=Path, required=True)
    parser.add_argument('--version', default=(ROOT / 'VERSION').read_text().strip())
    parser.add_argument('--output', type=Path, default=ROOT / 'builds/artifacts')
    args = parser.parse_args()
    template = ROOT / 'tools/export-templates/windows_release_x86_64.exe'
    binary = template.read_bytes()
    offset = struct.unpack_from('<I', binary, 0x3c)[0]
    assert binary[:2] == b'MZ' and binary[offset:offset+4] == b'PE\0\0'
    assert struct.unpack_from('<H', binary, offset+4)[0] == 0x8664
    assert args.pack.read_bytes()[:4] == b'GDPC'
    args.output.mkdir(parents=True, exist_ok=True)
    staging = ROOT / 'builds/windows-package'
    if staging.exists():shutil.rmtree(staging)
    staging.mkdir()
    shutil.copyfile(template, staging / 'Dolphin2.exe')
    shutil.copyfile(args.pack, staging / 'Dolphin2.pck')
    for source in (ROOT / 'launchers').glob('*.cmd'):shutil.copyfile(source, staging / source.name)
    for name in ['README.md', 'docs/GODOT-LICENSE.txt', 'docs/NOTO-LICENSE.txt']:
        shutil.copyfile(ROOT / name, staging / Path(name).name)
    (staging / 'VERSION.txt').write_text(args.version + '\n', encoding='utf-8')
    artifact = args.output / f'Dolphin2-Shanghai-Windows-v{args.version}.zip'
    with zipfile.ZipFile(artifact, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for source in sorted(staging.iterdir()):archive.write(source, 'Dolphin2-Shanghai/' + source.name)
    with zipfile.ZipFile(artifact) as archive:
        assert archive.testzip() is None
        assert len(archive.namelist()) >= 7
        assert not any(n.lower().endswith(('.png', '.jpg', '.mp4', '.webm')) for n in archive.namelist())
    digest = hashlib.sha256(artifact.read_bytes()).hexdigest()
    artifact.with_suffix('.sha256').write_text(digest + '  ' + artifact.name + '\n')
    print(f'{artifact} ({artifact.stat().st_size} bytes; SHA256 {digest})')


if __name__ == '__main__':main()
