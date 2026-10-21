"""Run Godot 4.5.2 verification on Windows or a desktop Linux session.

All generated evidence stays in ignored builds/. Native capture uses Godot's
actual viewport and the isolated test save, never the normal player's save.
"""
import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
VERSION = '4.5.2.stable'


def find_godot(explicit=None):
    candidates = [explicit, os.environ.get('GODOT_BIN')]
    candidates += [
        ROOT / 'tools/godot-4.5.2/Godot_v4.5.2-stable_win64.exe',
        ROOT / 'tools/Godot_v4.5.2-stable_win64.exe',
        ROOT / 'tools/Godot_v4.5.2-stable_linux.x86_64',
        shutil.which('godot'), shutil.which('godot4'),
    ]
    for candidate in candidates:
        if not candidate:
            continue
        path = Path(candidate).expanduser().resolve()
        if not path.is_file():
            if explicit:
                raise ValueError(f'Godot executable does not exist: {path}')
            continue
        result = subprocess.run([str(path), '--version'], capture_output=True,
                                text=True, encoding='utf-8', errors='replace',
                                creationflags=creation_flags(), timeout=20)
        version = result.stdout.strip()
        if result.returncode or not version.startswith(VERSION + '.'):
            raise ValueError(f'Godot 4.5.2 required; found {version!r} at {path}')
        return path
    raise ValueError('Godot 4.5.2 not found. Set GODOT_BIN or pass --godot.')


def creation_flags():
    # Suppress the console helper window; native Godot still opens its game window.
    return subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0


def build_command(args, godot, output):
    command = [str(godot)]
    if args.pack:
        command += ['--main-pack', str(args.pack.resolve())]
    else:
        command += ['--path', str(ROOT)]
    command += ['--audio-driver', 'Dummy', '--log-file', str(output / 'runtime.log')]
    if args.mode == 'import':
        return command + ['--headless', '--editor', '--import']
    if args.mode == 'export':
        return command + ['--headless', '--export-pack', 'Windows Desktop',
                          str(output / 'Dolphin2.pck')]
    if args.headless:
        command.append('--headless')
    else:
        command += ['--rendering-method', 'gl_compatibility', '--resolution', '1600x900']
    user_args = []
    if args.mode == 'capture':
        user_args = ['--test', '--capture', '--capture-output', str(output)]
    elif args.mode == 'test':
        user_args = ['--test', '--test-result', str(output / 'results.json')]
        if args.suite == 'full':
            user_args += ['--test-world', '--test-polish', '--test-vehicle', '--test-impact']
        else:
            user_args += [f'--test-{args.suite}-only']
        user_args += ['--capture-output', str(output)] if args.shots else ['--no-capture']
    elif args.fresh:
        user_args = ['--fresh']
    return command + (['--'] + user_args if user_args else [])


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['import', 'run', 'test', 'capture', 'export'])
    parser.add_argument('--godot')
    parser.add_argument('--pack', type=Path, help='Verify an exported PCK from an isolated directory')
    parser.add_argument('--output', type=Path, default=ROOT / 'builds/native-local')
    parser.add_argument('--suite', choices=['full', 'impact', 'vehicle', 'polish', 'world'], default='full')
    parser.add_argument('--headless', action='store_true')
    parser.add_argument('--shots', action='store_true', help='Capture actual viewport during tests')
    parser.add_argument('--fresh', action='store_true', help='Skip loading normal save when playing')
    parser.add_argument('--timeout', type=int, help='Seconds; verification defaults to 600, playing is unlimited')
    args = parser.parse_args(argv)
    output = args.output.resolve()
    if not output.is_relative_to(ROOT / 'builds'):
        parser.error('--output must be inside ignored builds/')
    if (args.mode == 'capture' or args.shots) and args.headless:
        parser.error('Screenshots require native graphics; omit --headless')
    if args.pack and (args.mode in ('import', 'export') or not args.pack.is_file()):
        parser.error('--pack requires an existing PCK and run/test/capture mode')
    if args.timeout is not None and args.timeout <= 0:
        parser.error('--timeout must be positive')
    timeout = args.timeout if args.timeout is not None else (None if args.mode == 'run' else 600)
    try:
        godot = find_godot(args.godot)
        output.mkdir(parents=True, exist_ok=True)
        command = build_command(args, godot, output)
        cwd = output / 'isolated' if args.pack else ROOT
        cwd.mkdir(exist_ok=True)
        if args.mode == 'test':
            (output / 'results.json').unlink(missing_ok=True)
        started = time.time_ns()
        with (output / 'process.log').open('w', encoding='utf-8') as log:
            result = subprocess.run(command, cwd=cwd, stdout=log, stderr=subprocess.STDOUT,
                                    creationflags=creation_flags(), timeout=timeout)
        code = result.returncode
        runtime = (output / 'runtime.log').read_text(encoding='utf-8', errors='replace')
        errors = [line for line in runtime.splitlines()
                  if line.startswith(('ERROR:', 'SCRIPT ERROR:'))]
        if errors:
            print('\n'.join(errors), file=sys.stderr)
            code = code or 1
        if args.mode == 'test' and code == 0:
            results = json.loads((output / 'results.json').read_text(encoding='utf-8'))
            if (results.get('failed') != 0 or results.get('passed', 0) <= 0
                    or len(results.get('checks', [])) != results['passed']
                    or not all(check[0] is True for check in results['checks'])):
                raise ValueError('Test process exited without a complete passing result')
            print(f"Tests: {results['passed']} passed, 0 failed")
        if args.mode == 'export' and code == 0:
            with (output / 'Dolphin2.pck').open('rb') as pack:
                if pack.read(4) != b'GDPC':
                    raise ValueError('Export did not produce a Godot PCK')
        if (args.mode == 'capture' or args.shots) and code == 0:
            if not any(p.stat().st_mtime_ns >= started for p in output.glob('*.png')):
                raise ValueError('Native run did not produce fresh screenshots')
        print(f'{args.mode}: exit {code}; evidence: {output}')
        return code
    except (ValueError, OSError, subprocess.TimeoutExpired, subprocess.SubprocessError) as error:
        print(str(error), file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
