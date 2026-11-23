# EAB Credit — deployment and updates

Demo URL: **https://eab-credit.preview.james-benjamin.com**. James Benjamin administers the VM through the GCP browser terminal and uploads only a release tar archive. The server has no GitHub checkout; the installer is included in the archive. Visitors use the domain directly; they do not need an SSH tunnel. See the [deployment record](DEPLOYMENT_LOG.md) for observed setup and checks awaiting recorded results.

## Environment and architecture

| Item | Value |
|---|---|
| Instance | instance-20260709-161649 |
| Target OS / architecture | Debian Trixie / x86_64 |
| Target machine | e2-micro, 2 vCPUs, 1 GB RAM, 30 GB disk |
| Account / home | jamesbenjamin450 / /home/jamesbenjamin450 |
| External IP | 34.72.123.66 |
| Internal IP | 10.128.0.2 — do not use in public DNS |
| Domain | eab-credit.preview.james-benjamin.com |
| Project / zone | Not recorded |

Confirm whether the external IP is static. An ephemeral address can change after stopping/starting the VM; reserving/promoting it can affect billing. Update DNS if the address changes.

~~~text
Browser → domain → VM:443 → nginx (TLS)
                             ├─ built frontend static files
                             └─ /api/* → 127.0.0.1:5001
                                          Gunicorn → Flask → saved model
~~~

The frontend and API share one origin. Gunicorn runs one synchronous worker as an unprivileged user, managed by systemd, with one model/BLAS/OpenMP thread and a 650 MiB memory cap. Build frontend assets on the development computer. Do not train on the VM.

| VM path | Purpose |
|---|---|
| /opt/eab-credit/releases/ | Separate releases with their own Python environments |
| /opt/eab-credit/current | Symlink to active release |
| /opt/eab-credit/current/frontend-dist/ | Built frontend |
| /opt/eab-credit/current/lending_artifacts/ | Model, calibrator, metadata |
| /etc/systemd/system/eab-credit.service | Gunicorn service |
| /etc/nginx/sites-available/eab-credit | Live domain and HTTPS configuration |
| /etc/letsencrypt/ | Certificates and renewal configuration; stays on VM |
| /opt/eab-credit/verification/RELEASE_ID/ | Install logs, tests, manifest, resource reports |

## Initial setup

The owner confirmed SCP upload. Terminal output showed the archive in /home/jamesbenjamin450. Initial installation commands supplied for the GCP browser terminal were:

~~~sh
curl -fL \
  https://raw.githubusercontent.com/JamesBenji/LendingCreditPrototype/6527f59086ab6b7943ca8085982ec3ec0f84efea/deploy/install-vm.sh \
  -o ~/install-vm.sh
sudo bash ~/install-vm.sh \
  ~/eab-credit-6527f59086ab.tar.gz \
  8285d330ed14d93cfa093e93450bbb6cf140be00176aac084542dd5856923fb2
~~~

The installer checks integrity and Python/model compatibility, installs nginx and binary-only runtime packages, runs backend tests and exact synthetic predictions, activates the release, checks HTTP before/after service restart, and records resources. The archive excludes training data/notebook, Node modules and the local virtual environment. Installation results have not been supplied to this checkout.

### Domain and HTTPS setup

These are the selected setup steps; completion output for DNS, firewall and certificates has not been provided.

1. In the DNS zone for **james-benjamin.com**, create an **A** record named **eab-credit.preview**, pointing to **34.72.123.66**. Remove conflicting records for this hostname. If using Cloudflare, use DNS-only while establishing direct certificate issuance.
2. In the VM's VPC, allow ingress TCP **80,443** from **0.0.0.0/0**, targeting the VM's **eab-web** network tag. Keep port 5001 private. Actual rule name/tag assignment is not recorded.
3. Edit the live nginx site, retaining its existing root and location/proxy blocks. Before Certbot its header should be:

~~~nginx
server {
    listen 127.0.0.1:8080;
    listen 80;
    server_name eab-credit.preview.james-benjamin.com;
    # Existing root and location blocks follow.
}
~~~

Validate and reload, then check the HTTP domain loads:

~~~sh
sudo nginx -t
sudo systemctl reload nginx
~~~

Install Certbot, issue the certificate, configure HTTP redirection and test renewal:

~~~sh
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d eab-credit.preview.james-benjamin.com --redirect
sudo certbot renew --dry-run
systemctl list-timers --all | grep certbot
~~~

Certbot adds HTTPS listeners, certificate paths and redirects. Do not replace the resulting nginx file with the repository's original loopback template. Keep port 80 reachable for HTTP certificate validation/renewal. The public demo has no application login; use synthetic inputs.

## Update the codebase tomorrow

Build locally. Upload through the browser terminal or SCP. Install through the GCP browser terminal. Expect a short service interruption during activation/restart.

### 1. Prepare and test locally

If changes are already on GitHub, start with a clean checkout:

~~~sh
git pull --ff-only origin main
~~~

If making changes locally, commit the reviewed changes before packaging. From the repository root with the installed environments:

~~~sh
(cd flask_app && ../.venv/bin/python -m unittest discover -s tests -v)
(cd flask_app/frontend && npm ci && node --test src/lib/debt-to-income.test.js && npm run lint)
.venv/bin/python scripts/package_release.py
~~~

Packaging builds the frontend and prints the **new archive filename, source commit and SHA-256**, also writing a checksum file beside it. Use the new values, not the initial release checksum. Do not deploy an --allow-dirty preview.

The new codebase must retain or deliberately update files/artifacts expected by scripts/package_release.py. An arbitrary source ZIP lacks the built assets and integrity manifest. The VM needs neither Node nor the training dataset.

If model artifacts or scoring logic change intentionally, regenerate deploy/smoke-fixtures.json from reviewed local synthetic outputs, update artifact hashes/tests/compatibility evidence, and commit before packaging. Do not change fixtures to hide unexplained differences. Preserve original thesis evidence tied to its inspected commit; evaluate a new model separately.

### 2. Upload only the new tar archive

Upload the new archive with the GCP browser terminal file-upload action. It already contains deploy/install-vm.sh; do not upload a second file or clone a GitHub repository on the server. If using SCP instead, transfer only the archive:

~~~sh
scp release-bundles/eab-credit-NEW_COMMIT.tar.gz \
  jamesbenjamin450@34.72.123.66:/home/jamesbenjamin450/
~~~

Replace NEW_COMMIT with the filename printed by packaging. The commands below assume the uploaded archive is in /home/jamesbenjamin450. The browser upload option needs no local SSH connection. Git is used only on the development computer; no server-side checkout is required.

Always extract the installer from the new archive. The original 6527f59 installer overwrites nginx settings. Current archives include an installer supporting PRESERVE_NGINX=1 and SMOKE_BASE_URL. Do not reuse a leftover initial installer from the home directory.

### 3. Back up on the VM

Confirm the existing HTTPS application works, then create a dated private backup:

~~~sh
curl -fsS https://eab-credit.preview.james-benjamin.com/api/health
sudo nginx -t
backup_dir="/opt/eab-credit/backups/$(date -u +%Y%m%dT%H%M%SZ)"
sudo install -d -m 0700 "$backup_dir"
sudo cp -a /etc/nginx/sites-available/eab-credit "$backup_dir/nginx.conf"
sudo cp -a /etc/systemd/system/eab-credit.service "$backup_dir/eab-credit.service"
sudo cp -a /etc/letsencrypt "$backup_dir/letsencrypt"
readlink -f /opt/eab-credit/current | sudo tee "$backup_dir/previous-release.txt"
echo "$backup_dir"
~~~

Record the printed backup path. It contains private certificate keys and must stay private on the VM. The installer also saves the previous site/unit configuration and release path.

### 4. Install while preserving HTTPS

Set the new archive filename and packaging checksum, then verify the archive, extract its installer and run it. The && operators stop the sequence if verification or extraction fails:

~~~sh
release_bundle=~/eab-credit-NEW_COMMIT.tar.gz
release_sha=NEW_SHA256
printf '%s  %s\n' "$release_sha" "$release_bundle" | sha256sum -c - && \
tar -xOf "$release_bundle" deploy/install-vm.sh > ~/install-vm.sh && \
sudo PRESERVE_NGINX=1 \
  SMOKE_BASE_URL=https://eab-credit.preview.james-benjamin.com \
  bash ~/install-vm.sh "$release_bundle" "$release_sha"
~~~

Replace both placeholders. This retains the live nginx site and domain/TLS settings, installs a separate release, and switches the current symlink after local preflight. It verifies frontend, exact predictions and invalid requests through HTTPS before/after restart. Public DNS/HTTPS must already work from the VM; Certbot may have changed the original loopback listener, hence the explicit public URL.

Runtime pins live in deploy/requirements.txt: Python 3.13-compatible libraries, CPU-only XGBoost 2.1.4 and Gunicorn. Dependency changes need fresh compatibility checks. No DNS/firewall/resource changes are made by the installer.

### 5. Confirm and record

~~~sh
sudo systemctl status eab-credit nginx --no-pager
curl -fsS https://eab-credit.preview.james-benjamin.com/api/health
cat /opt/eab-credit/current/deployment-manifest.json
sudo systemctl show eab-credit -p MemoryCurrent -p MemoryPeak -p MemoryMax
free -m
df -h /
~~~

The installer already runs the full HTTP test. For troubleshooting or verification after another change:

~~~sh
sudo /opt/eab-credit/current/.venv/bin/python \
  /opt/eab-credit/current/scripts/smoke_http.py \
  https://eab-credit.preview.james-benjamin.com
~~~

Open the domain, refresh and assess all three examples. Check UI changes, DTI and tooltips. Record source commit, artifact hashes and verification directory in the deployment record. New model outcomes must be reviewed locally first.

## Logs, restart and rollback

~~~sh
sudo journalctl -u eab-credit -n 100 --no-pager
sudo tail -n 100 /var/log/nginx/eab-credit.error.log
sudo systemctl restart eab-credit
sudo nginx -t
sudo systemctl reload nginx
sudo certbot certificates
~~~

If activation fails, the installer attempts to restore the preceding release/configuration. Inspect install.log and check the domain before assuming rollback succeeded. Keep previous releases through the demonstration.

For manual code rollback, use the exact previous release path saved in your backup. Replace PREVIOUS_RELEASE_ID:

~~~sh
sudo systemctl stop eab-credit
sudo ln -s /opt/eab-credit/releases/PREVIOUS_RELEASE_ID /opt/eab-credit/rollback-link
sudo mv -Tf /opt/eab-credit/rollback-link /opt/eab-credit/current
sudo install -m 0644 /opt/eab-credit/current/deploy/eab-credit.service \
  /etc/systemd/system/eab-credit.service
sudo systemctl daemon-reload
sudo nginx -t
sudo systemctl restart eab-credit
curl -fsS https://eab-credit.preview.james-benjamin.com/api/health
sudo /opt/eab-credit/current/.venv/bin/python \
  /opt/eab-credit/current/scripts/smoke_http.py \
  https://eab-credit.preview.james-benjamin.com
~~~

Leave HTTPS nginx settings intact during code rollback. Do not copy the old release's deploy/nginx.conf onto the live site. If nginx itself needs restoration, restore the dated VM backup, validate and reload. Restore certificate files only if changed or damaged.

## Evidence and limitations

Local checks passed: 27 backend tests, 6 DTI tests, frontend lint/build, exact synthetic parity and invalid requests, plus Gunicorn HTTP before/after restart. See [Python compatibility](evidence/python313-compatibility.json), [local HTTP](evidence/local-wsgi-http.json), [runtime inspection](evidence/runtime-inspection.json) and [Linux wheels](evidence/linux-wheel-availability.json). The final initial archive's 98 file hashes and extracted-code parity were checked locally; the older [extracted report](evidence/extracted-bundle-check.json) covers the 97-file preview.

Local process peak was about 156 MiB on Mac ARM64, not measured whole-VM Linux usage. The installer requires 350 MB available before preflight, preflight peak at most 600 MiB and 100 MB headroom after activation. Debian execution, VM resources, hosted checks, certificate issuance/renewal and rollback remain owner-operated checks whose outputs have not been received. No full VM reboot has been verified.

The installer update passed local shell syntax checks, both nginx preserve/install branch checks, invalid-option rejection and syntax checks for the documented shell commands. Both HTTP restart checks use the selected URL. These checks do not execute nginx, Certbot or systemd on the VM; model and prediction code are unchanged.

If the minimal one-worker CPU-only setup fails memory gates, inspect other processes first, then size the next machine from measured peak and OS headroom. Do not train/build on this VM or add workers to solve memory shortage.
