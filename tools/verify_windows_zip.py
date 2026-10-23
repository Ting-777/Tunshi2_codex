"""On Windows, verify the shipped EXE finds its neighbouring PCK automatically."""
import argparse
import json
from pathlib import Path
import subprocess
import zipfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('zip', type=Path)
    args = parser.parse_args()
    root = args.zip.resolve().parent / 'unpacked-check'
    with zipfile.ZipFile(args.zip) as archive:archive.extractall(root)
    folder = root / 'Dolphin2-Shanghai'
    for suite, minimum in [('prologue', 61), ('chapter1', 69)]:
        result = root / (suite + '-results.json');log = root / (suite + '-runtime.log')
        command = [str(folder / 'Dolphin2.exe'), '--headless', '--audio-driver', 'Dummy',
                   '--log-file', str(log), '--', '--test', '--test-' + suite, '--no-capture',
                   '--test-result', str(result)]
        subprocess.run(command, cwd=folder, check=True, timeout=600)
        data = json.loads(result.read_text(encoding='utf-8'))
        assert data['failed'] == 0 and data['passed'] >= minimum
        assert not any(line.startswith(('ERROR:', 'SCRIPT ERROR:')) for line in log.read_text(encoding='utf-8').splitlines())
        print(f"Unpacked Windows EXE {suite}: {data['passed']} passed; automatic PCK discovery verified.")


if __name__ == '__main__':main()
