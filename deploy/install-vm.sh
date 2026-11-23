#!/usr/bin/env bash
# Run on the authorized Debian Trixie VM after uploading a trusted bundle.
set -Eeuo pipefail
if ! [ -v WHEELHOUSE ]; then WHEELHOUSE=""; fi

if [ "$#" -ne 2 ] || [ "$EUID" -ne 0 ]; then
  echo "Usage: sudo bash install-vm.sh /tmp/eab-credit-COMMIT.tar.gz SHA256" >&2
  exit 2
fi
umask 022
bundle=$(realpath "$1")
expected_sha=$2
if ! [[ "$expected_sha" =~ ^[a-fA-F0-9]{64}$ ]]; then
  echo "Expected SHA256 must contain 64 hex characters." >&2
  exit 2
fi
printf '%s  %s\n' "$expected_sha" "$bundle" | sha256sum -c -
. /etc/os-release
if [ "$VERSION_CODENAME" != trixie ] || [ "$(uname -m)" != x86_64 ]; then
  echo "This pinned release targets Debian Trixie x86_64; verify another platform separately." >&2
  exit 2
fi
if ! command -v python3 >/dev/null 2>&1; then
  apt-get update
  DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends python3
fi

install_root=/opt/eab-credit
install -d -m 0755 "$install_root/releases" "$install_root/verification"
stage=$(mktemp -d "$install_root/releases/.staging-XXXXXX")
python3 - "$bundle" "$stage" <<'PY'
import hashlib, json, pathlib, re, sys, tarfile
bundle, destination = sys.argv[1:]
with tarfile.open(bundle) as archive:
    for member in archive.getmembers():
        path = pathlib.PurePosixPath(member.name)
        if path.is_absolute() or ".." in path.parts or not (member.isfile() or member.isdir()):
            raise SystemExit("Unsafe archive member: " + member.name)
    archive.extractall(destination, filter="data")
root = pathlib.Path(destination)
manifest = json.loads((root / "deployment-manifest.json").read_text())
if not re.fullmatch(r"[a-f0-9]{40}", manifest["source_commit"]):
    raise SystemExit("Invalid source commit")
if manifest["working_tree_dirty"]:
    raise SystemExit("Preview/dirty bundle: commit and package the deployment source first")
for name, digest in manifest["files"].items():
    path = pathlib.PurePosixPath(name)
    if path.is_absolute() or ".." in path.parts:
        raise SystemExit("Unsafe manifest path")
    actual = hashlib.sha256((root / name).read_bytes()).hexdigest()
    if actual != digest:
        raise SystemExit("File integrity mismatch: " + name)
PY

release_id=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["source_commit"][:12]+"-"+sys.argv[2][:8])' "$stage/deployment-manifest.json" "$expected_sha")
release_dir="$install_root/releases/$release_id"
if [ -e "$release_dir" ]; then
  echo "Release already exists: $release_dir. Use the recorded restart/rollback commands." >&2
  exit 2
fi
mv "$stage" "$release_dir"
chmod 0755 "$release_dir"
log_dir="$install_root/verification/$release_id"
install -d -m 0755 "$log_dir"
exec > >(tee -a "$log_dir/install.log") 2>&1
echo "Release: $release_id"
cp "$release_dir/deployment-manifest.json" "$log_dir/manifest.json"
cp /etc/os-release "$log_dir/os-release"
uname -a > "$log_dir/uname.txt"
free -m > "$log_dir/memory-before.txt"

if [ -e "$install_root/current" ] && [ ! -L "$install_root/current" ]; then
  echo "current must be an app-owned symlink, not an existing directory." >&2
  exit 2
fi
old_release=$(readlink -f "$install_root/current" || true)
printf '%s\n' "$old_release" > "$log_dir/previous-release.txt"
config_touched=0
activated=0

set_current() {
  local target=$1
  local link
  link=$(mktemp -u "$install_root/.current-XXXXXX")
  ln -s "$target" "$link"
  mv -Tf "$link" "$install_root/current"
}

on_failure() {
  local status=$1
  trap - ERR
  set +e
  if [ "$activated" -eq 1 ]; then
    systemctl stop eab-credit
    if [ -n "$old_release" ]; then set_current "$old_release"; else rm -f "$install_root/current"; fi
  fi
  if [ "$config_touched" -eq 1 ]; then
    if [ ! -e "$log_dir/unit.before" ]; then systemctl disable eab-credit; fi
    for pair in "unit:/etc/systemd/system/eab-credit.service" "nginx:/etc/nginx/sites-available/eab-credit" "enabled:/etc/nginx/sites-enabled/eab-credit"; do
      name=$(printf '%s' "$pair" | cut -d: -f1)
      path=$(printf '%s' "$pair" | cut -d: -f2-)
      if [ -e "$log_dir/$name.before" ] || [ -L "$log_dir/$name.before" ]; then
        cp -a --remove-destination "$log_dir/$name.before" "$path"
      else
        rm -f "$path"
      fi
    done
    systemctl daemon-reload
    nginx -t && systemctl reload nginx
    if [ -n "$old_release" ]; then systemctl restart eab-credit; fi
  fi
  echo "Installation failed; previous activation restored where present. Evidence: $log_dir" >&2
  exit "$status"
}
trap 'on_failure "$?"' ERR

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends python3 python3-venv nginx libgomp1 libstdc++6 ca-certificates
python3 -c 'import sys; assert sys.version_info[:2] == (3,13), "Expected Python 3.13 on Trixie"'
if ! getent group eab-credit >/dev/null 2>&1; then groupadd --system eab-credit; fi
if ! id eab-credit >/dev/null 2>&1; then
  useradd --system --gid eab-credit --no-create-home --shell /usr/sbin/nologin eab-credit
fi
python3 -m venv "$release_dir/.venv"
if [ -n "$WHEELHOUSE" ]; then
  "$release_dir/.venv/bin/python" -m pip install --no-index --find-links "$WHEELHOUSE" --only-binary=:all: -r "$release_dir/deploy/requirements.txt"
else
  "$release_dir/.venv/bin/python" -m pip install --only-binary=:all: -r "$release_dir/deploy/requirements.txt"
fi
"$release_dir/.venv/bin/python" -m pip check
"$release_dir/.venv/bin/python" -m pip freeze > "$log_dir/pip-freeze.txt"
export MODEL_THREADS=1 OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 MKL_NUM_THREADS=1 PYTHONDONTWRITEBYTECODE=1
available_kib=$(awk '/MemAvailable:/ {print $2}' /proc/meminfo)
if [ "$available_kib" -lt 350000 ]; then
  echo "Less than 350 MB available before model preflight; inspect other services or VM sizing first." >&2
  exit 2
fi
"$release_dir/.venv/bin/python" "$release_dir/scripts/check_release.py" --output "$log_dir/preflight.json"
(cd "$release_dir/flask_app" && ../.venv/bin/python -m unittest discover -s tests -v)

if ! systemctl is-active --quiet eab-credit && ss -ltnH '( sport = :5001 )' | awk 'END {exit(NR==0)}'; then
  echo "Port 5001 is occupied by a different service; no process will be killed." >&2
  exit 2
fi
for pair in "unit:/etc/systemd/system/eab-credit.service" "nginx:/etc/nginx/sites-available/eab-credit" "enabled:/etc/nginx/sites-enabled/eab-credit"; do
  name=$(printf '%s' "$pair" | cut -d: -f1)
  path=$(printf '%s' "$pair" | cut -d: -f2-)
  if [ -e "$path" ] || [ -L "$path" ]; then cp -a "$path" "$log_dir/$name.before"; fi
done
config_touched=1
install -m 0644 "$release_dir/deploy/eab-credit.service" /etc/systemd/system/eab-credit.service
install -m 0644 "$release_dir/deploy/nginx.conf" /etc/nginx/sites-available/eab-credit
ln -sfn /etc/nginx/sites-available/eab-credit /etc/nginx/sites-enabled/eab-credit
nginx -t
activated=1
set_current "$release_dir"
systemctl daemon-reload
systemctl enable eab-credit
systemctl restart eab-credit
systemctl reload nginx
"$release_dir/.venv/bin/python" "$release_dir/scripts/smoke_http.py" http://127.0.0.1:8080 --output "$log_dir/http-first-start.json"
systemctl restart eab-credit
"$release_dir/.venv/bin/python" "$release_dir/scripts/smoke_http.py" http://127.0.0.1:8080 --output "$log_dir/http-after-restart.json"
systemctl show eab-credit -p ActiveState -p MainPID -p MemoryCurrent -p MemoryPeak -p MemoryMax > "$log_dir/service-resources.txt"
ps -eo pid,ppid,rss,comm,args | awk '/gunicorn|nginx/ && !/awk/' > "$log_dir/process-memory.txt"
free -m > "$log_dir/memory-after.txt"
available_after_kib=$(awk '/MemAvailable:/ {print $2}' /proc/meminfo)
if [ "$available_after_kib" -lt 100000 ]; then
  echo "Less than 100 MB VM headroom after verification; do not call this sizing sufficient." >&2
  false
fi
df -h / > "$log_dir/disk.txt"
ss -ltnp > "$log_dir/listeners.txt"
echo "Verified private demo: forward local port 8080 to this VM's 127.0.0.1:8080."
echo "No firewall rules or paid resources were changed. Evidence: $log_dir"
