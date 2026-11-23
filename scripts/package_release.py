"""Build frontend locally and create a small, checksummed deployment bundle."""
import argparse
import gzip
import hashlib
import io
import json
from pathlib import Path
import subprocess
import tarfile

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "release-bundles")
    parser.add_argument("--allow-dirty", action="store_true", help="Label a local preview snapshot; do not call it a committed deployment")
    args = parser.parse_args()
    tracked_dirty = bool(subprocess.check_output(["git", "diff", "HEAD", "--", "flask_app", "deploy", "scripts", "docs", "README.md"], cwd=ROOT))
    untracked = subprocess.check_output(["git", "ls-files", "--others", "--exclude-standard", "flask_app", "deploy", "scripts", "docs", "README.md"], cwd=ROOT, text=True).strip()
    dirty = tracked_dirty or bool(untracked)
    if dirty and not args.allow_dirty:
        raise SystemExit("Commit the deployment source first, or use --allow-dirty for a clearly labelled local preview.")
    subprocess.run(["npm", "run", "build"], cwd=ROOT / "flask_app/frontend", check=True)
    commit = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    sources = {}
    for name in ["app.py", "application_schema.py", "predictor.py", "repayment.py", "wsgi.py", "requirements.txt"]:
        sources[f"flask_app/{name}"] = ROOT / "flask_app" / name
    allowed = {"deploy": {".sh", ".conf", ".service", ".txt", ".json"}, "lending_artifacts": {".joblib", ".json"}, "docs": {".md", ".json"}}
    for prefix, suffixes in allowed.items():
        for path in (ROOT / prefix).rglob("*"):
            if path.is_file() and path.suffix in suffixes and "__pycache__" not in path.parts:
                sources[str(path.relative_to(ROOT))] = path
    for name in ["check_release.py", "smoke_http.py"]:
        sources[f"scripts/{name}"] = ROOT / "scripts" / name
    for path in (ROOT / "flask_app/tests").glob("*.py"):
        sources[str(path.relative_to(ROOT))] = path
    name = "flask_app/frontend/src/lib/application-examples.json"
    sources[name] = ROOT / name
    sources["README.md"] = ROOT / "README.md"
    for path in (ROOT / "flask_app/frontend/dist").rglob("*"):
        if path.is_file():
            sources["frontend-dist/" + str(path.relative_to(ROOT / "flask_app/frontend/dist"))] = path
    contents = {name: path.read_bytes() for name, path in sources.items()}
    fixture = json.loads(contents["deploy/smoke-fixtures.json"])
    manifest = {
        "source_commit": commit, "research_commit": fixture["research_commit"], "working_tree_dirty": dirty,
        "artifact_sha256": fixture["artifact_sha256"],
        "files": {name: hashlib.sha256(data).hexdigest() for name, data in sorted(contents.items())},
    }
    contents["deployment-manifest.json"] = (json.dumps(manifest, indent=2) + "\n").encode()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    label = commit[:12] + ("-preview" if dirty else "")
    output = args.output_dir / f"eab-credit-{label}.tar.gz"
    with output.open("wb") as raw:
        with gzip.GzipFile(filename="", fileobj=raw, mode="wb", mtime=0) as compressed:
            with tarfile.open(fileobj=compressed, mode="w") as archive:
                for name, data in sorted(contents.items()):
                    info = tarfile.TarInfo(name)
                    info.size = len(data)
                    info.mode = 0o755 if name.endswith(".sh") else 0o644
                    info.mtime = 0
                    archive.addfile(info, io.BytesIO(data))
    digest = hashlib.sha256(output.read_bytes()).hexdigest()
    output.with_suffix(output.suffix + ".sha256").write_text(f"{digest}  {output.name}\n")
    print(json.dumps({"bundle": str(output), "bytes": output.stat().st_size, "sha256": digest, "source_commit": commit, "preview": dirty}, indent=2))


if __name__ == "__main__":
    main()
