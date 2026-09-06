"""Build or verify a deterministic, allowlisted MV3 archive. No source mutation."""
from pathlib import Path
import argparse
import hashlib
import io
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
FILES = ('index.html', 'manifest.json', 'preload.js', 'i18n.js', 'quotes.js',
         'ui.js', 'script.js', 'earth-scene.js', 'style.css', 'PRIVACY.md')
FOLDERS = ('assets', 'icons', '_locales', 'styles')


def release_files():
    paths = [ROOT / name for name in FILES]
    for folder in FOLDERS:
        paths.extend(p for p in (ROOT / folder).rglob('*') if p.is_file())
    for p in paths:
        if not p.resolve().is_relative_to(ROOT) or p.is_symlink():
            raise ValueError(f'Unsafe release path: {p}')
    return sorted(paths, key=lambda p: p.relative_to(ROOT).as_posix())


def verify(archive, paths):
    expected = {p.relative_to(ROOT).as_posix(): p.read_bytes() for p in paths}
    with zipfile.ZipFile(archive) as bundle:
        assert bundle.testzip() is None, 'Corrupt archive'
        assert len(bundle.namelist()) == len(set(bundle.namelist())), 'Duplicate entries'
        assert set(bundle.namelist()) == set(expected), 'Unexpected or missing release files'
        for name, content in expected.items():
            assert bundle.read(name) == content, f'Stale release file: {name}'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--verify', action='store_true')
    args = parser.parse_args()
    manifest = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))
    version = manifest['version']
    assert json.loads((ROOT / 'package.json').read_text(encoding='utf-8'))['version'] == version
    paths = release_files()
    output = ROOT / 'dist' / f'vera-edge-{version}.zip'
    if not args.verify:
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as bundle:
            for p in paths:
                info = zipfile.ZipInfo(p.relative_to(ROOT).as_posix(), date_time=(2026, 1, 1, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                info.create_system = 3
                info.external_attr = 0o100644 << 16
                bundle.writestr(info, p.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
        verify(io.BytesIO(buffer.getvalue()), paths)
        output.parent.mkdir(exist_ok=True)
        output.write_bytes(buffer.getvalue())
    verify(output, paths)
    print(json.dumps({'archive': str(output), 'version': version, 'files': len(paths),
                      'bytes': output.stat().st_size, 'sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
                      'verified': True}, ensure_ascii=False))


if __name__ == '__main__':
    main()
