# Private single-VM thesis demo deployment

## Status and evidence

**Prepared locally; not deployed to GCP yet.** Instance identity and an authorized SSH method have not been supplied. No GCP instance, address, firewall rule or paid resource has been created/changed. The inspected research/application commit is **d8643c8e1f3aa3c34ba95279291706a7ac96d5eb**; the prepared deployment commit is recorded by the bundle manifest when packaging. Artifact hashes remain those in [runtime evidence](evidence/runtime-inspection.json).

| Check | Result / boundary |
|---|---|
| Existing Python 3.9 artifact inspection | Passed; reproduced full-feature XGBoost metrics and synthetic outputs |
| Isolated Python 3.13.9 + NumPy 2.2.6 compatibility | Passed exact synthetic response parity; no load warnings; app debug false; [report](evidence/python313-compatibility.json) |
| Local production Gunicorn HTTP | Health, options, all three exact predictions and structured invalid 400 passed; [report](evidence/local-wsgi-http.json) |
| Local production restart | Gunicorn restarted and the same checks passed again; [first start](evidence/local-wsgi-http-first-start.json) versus [post-restart](evidence/local-wsgi-http.json) |
| Extracted release bundle | All 97 packaged file hashes checked; isolated extracted code passed exact WSGI parity and invalid-request checks; [report](evidence/extracted-bundle-check.json) |
| Python 3.13 backend suite | All 27 backend tests also passed in the compatible Python 3.13 environment |
| Linux x86_64/Python 3.13 wheel availability | All 20 pinned binary wheels downloaded, ~82 MiB total; CPU-only XGBoost has no NVIDIA dependency; [manifest](evidence/linux-wheel-availability.json) |
| Debian execution / Linux CPU-only artifact load | **Pending authorized VM access**; downloaded wheels are not an executed Linux test |
| nginx config / systemd service on target | **Pending VM access**; shell/Python syntax checked locally, nginx itself is not installed locally |
| Actual e2-micro memory, disk, startup/restart | **Pending VM access**; do not claim target fit from Mac measurements |
| Public examiner URL / HTTPS | Not configured; initial demo is SSH-tunnel only |

Local resource measurements: original artifact process ~145.9 MiB peak / 1.43 s startup / 2.73 ms p95 direct scoring. Python 3.13 compatibility process ~155.7 MiB peak / **25.1 s first cold import** / 2.75 ms p95 Flask-client scoring. The second measurement is Mac ARM64 with standard XGBoost 2.1.4, not the Linux CPU-only build. These measurements suggest a single-worker 1 GB demo is plausible; they do not measure the VM OS, agents, nginx and Gunicorn master together. No training belongs on the VM.

## Architecture and operational changes

~~~text
Browser http://127.0.0.1:8080
        → encrypted SSH forwarding
        → VM nginx 127.0.0.1:8080
            → built frontend files
            → /api/* → Gunicorn 127.0.0.1:5001
                         → Flask → trusted saved artifacts
~~~

The existing React/Vite app fits static hosting and already uses same-origin /api paths. Build it on the development machine. The VM serves frontend-dist; it does not need Node, Vite, the training notebook or the dataset.

- [nginx.conf](../deploy/nginx.conf) binds only loopback port 8080 and preserves /api in proxy requests. Hashed assets are cached; HTML/API responses are not cached. API body limit is 16 KiB.
- [eab-credit.service](../deploy/eab-credit.service) runs one sync Gunicorn worker as an unprivileged service user, one model/BLAS/OpenMP thread, a 60-second worker timeout and a 650 MiB service cap.
- [wsgi.py](../flask_app/wsgi.py) changes inference parallelism only. It does not fit an estimator, modify trees/calibrator or write artifacts. Fixture parity verifies the behavior change is operational, not predictive.
- /api/health was added to confirm successful module/artifact startup without an expensive score. The development-server main block is not used by Gunicorn.
- [deploy/requirements.txt](../deploy/requirements.txt) pins the tested Python 3.13-compatible shared packages and production WSGI server. Linux uses xgboost-cpu 2.1.4 instead of standard XGBoost/NCCL; the module/model version remains 2.1.4. Actual Linux parity is a pre-activation gate.

The original broad research/app requirements remain for the inspected project; use the deployment-specific pins on Trixie. Standard Python 3.13 cannot normally install the original local NumPy 2.0.2 wheel, so the isolated test uses 2.2.6. Scikit-learn remains 1.6.1 and the calibrator/artifacts are unchanged.

The installer does not alter unrelated nginx sites. A Debian nginx default site or other existing listeners may remain; inspect the recorded listeners/config on the VM. The EAB application itself is bound to loopback. A pre-existing unrelated process on 5001 is not killed.

## Prepare a committed bundle off the VM

Review and commit the deployment source so its identity is reproducible. Local preview bundles may be built with --allow-dirty, but the VM installer rejects them.

~~~sh
# In the checkout; npm dependencies already installed, otherwise npm ci first.
.venv/bin/python scripts/package_release.py
~~~

The command rebuilds the frontend, bundles only serving code/tests, static output, trusted artifacts, configuration and evidence, and prints bundle SHA-256/source commit. It excludes the dataset, notebook, Node modules, virtual environment and local .mcp.json. Files are individually hashed in deployment-manifest.json. Bundle output is ignored under release-bundles/.

The downloaded Linux wheels are in /private/tmp/eab-credit-linux-wheels on the audit machine. They are not committed. They can be transferred as an optional offline wheelhouse to avoid Python downloads on the VM. OS packages still require repository access or preinstallation; a private VM without outbound access must be inspected before installing. Do not allocate Cloud NAT or an external address automatically.

## Authorized VM installation

Needed connection information: GCP project, instance name, zone and an existing SSH method (gcloud/IAP with an authorized login, or SSH host/user using an existing agent/key). Do not paste private keys, passwords or tokens. Confirm the SSH account can use sudo for systemd/nginx setup.

For a normal SSH alias/host, after authorization:

~~~sh
scp release-bundles/eab-credit-COMMIT.tar.gz deploy/install-vm.sh USER@HOST:/tmp/
ssh USER@HOST
sudo bash /tmp/install-vm.sh /tmp/eab-credit-COMMIT.tar.gz BUNDLE_SHA256
~~~

For gcloud/IAP, use the supplied project/zone/instance with gcloud compute scp and gcloud compute ssh --tunnel-through-iap. The audit environment currently has no gcloud executable; an existing SSH agent/alias may avoid another local SDK installation.

An optional wheelhouse install uses:

~~~sh
sudo WHEELHOUSE=/tmp/eab-credit-linux-wheels \
  bash /tmp/install-vm.sh /tmp/eab-credit-COMMIT.tar.gz BUNDLE_SHA256
~~~

The [installer](../deploy/install-vm.sh):

1. Validates outer checksum, safe archive paths, committed manifest and individual file hashes; requires Debian Trixie x86_64/Python 3.13.
2. Installs minimal OS runtime packages and binary-only Python dependencies into a release-local venv; no source builds/training.
3. Requires 350 MB available before model preflight, verifies artifact hashes, exact three-fixture WSGI parity and invalid requests, measures process peak, and runs backend tests.
4. Rejects a preflight process peak over 600 MiB; switches the current symlink atomically only after validation and nginx syntax checking.
5. Starts/enables the single-worker service and reloads the dedicated nginx site.
6. Runs full same-origin HTTP verification, restarts the service and repeats it. Records service/process memory, disk, listeners and VM headroom; less than 100 MB available after checks fails the sizing gate.
7. Restores the prior activation/configuration on activation failure where a prior release exists. Keeps evidence and releases for inspection.

These memory buffers are chosen demo safeguards, not a load-test guarantee. If a 1 GB VM fails the measured gates, first retain one worker/thread, CPU-only packages and no training/build workload. If that minimal setup still does not fit, use measured peak + OS headroom to justify the next practical shared-core memory size (e2-small, 2 GB); request approval before changing paid resources. No resize is performed by the scripts.

## Reach the private demo

~~~sh
ssh -N -L 127.0.0.1:8080:127.0.0.1:8080 USER@HOST
~~~

Then open **http://127.0.0.1:8080** locally. HTTP runs inside an encrypted SSH tunnel, so no public app port or domain is required. Keep the tunnel open. Existing SSH/IAP access must already be authorized; no new firewall rule is assumed.

With IAP:

~~~sh
gcloud compute ssh INSTANCE --project PROJECT --zone ZONE --tunnel-through-iap \
  -- -N -L 127.0.0.1:8080:127.0.0.1:8080
~~~

## Hosted verification and operations

Once the VM is reachable, run the HTTP check through the tunnel too, comparing with the same local fixtures:

~~~sh
.venv/bin/python scripts/smoke_http.py http://127.0.0.1:8080 \
  --output docs/evidence/hosted-http.json
~~~

It checks frontend HTML, hashed JS/CSS, logo/favicon, options, three exact response matches and a structured invalid 400. This is HTTP integration verification, not a browser pixel test. A final browser demonstration should confirm Set/Assess, DTI updates, tooltips and layout through the actual tunnel.

On the VM:

~~~sh
sudo systemctl status eab-credit nginx
sudo journalctl -u eab-credit -n 100 --no-pager
sudo tail -n 100 /var/log/nginx/eab-credit.error.log
sudo systemctl restart eab-credit
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl show eab-credit -p MemoryCurrent -p MemoryPeak -p MemoryMax
free -m
df -h /
~~~

Verification records are under /opt/eab-credit/verification/RELEASE_ID/: manifest, preflight, pip freeze, first-start and post-restart HTTP results, service/process memory, before/after free memory, disk, listeners and previous-release.txt. Record the source commit and artifact hashes from manifest.json in your deployment report. Service enablement is configured; a full VM reboot is not claimed unless actually performed.

## Rollback

Read previous-release.txt for the last activated path. Do not remove releases before the demonstration.

~~~sh
sudo systemctl stop eab-credit
sudo ln -s /opt/eab-credit/releases/PREVIOUS_RELEASE /opt/eab-credit/rollback-link
sudo mv -Tf /opt/eab-credit/rollback-link /opt/eab-credit/current
sudo install -m 0644 /opt/eab-credit/current/deploy/eab-credit.service /etc/systemd/system/eab-credit.service
sudo install -m 0644 /opt/eab-credit/current/deploy/nginx.conf /etc/nginx/sites-available/eab-credit
sudo systemctl daemon-reload
sudo nginx -t
sudo systemctl restart eab-credit
sudo systemctl reload nginx
sudo /opt/eab-credit/current/.venv/bin/python /opt/eab-credit/current/scripts/smoke_http.py http://127.0.0.1:8080
~~~

Use an existing previous release, not a literal placeholder. Installer-created .before backups preserve the preceding actual unit/site configuration. On the first deployment there is no earlier application to restore; stop/disable the dedicated service instead, retain its evidence and correct the failure before activation.

## Public examiner access without a domain

Initial access stays tunneled. Before changing networking or spending on resources, choose an explicit access plan:

- Keep the private tunnel and screen-share, or grant separately authorized SSH/IAP access.
- A temporary authenticated HTTPS tunnel provider can supply a public hostname without a VM domain or inbound app firewall rule. It introduces another service; choose its access controls and lifetime explicitly.
- An existing public IP can be restricted to examiner IPs, but trusted HTTPS needs a certificate/client supporting IP-address certificates or a domain. Check current CA/client availability; do not assume IP certificates are impossible or automatically supported. A self-signed certificate encrypts traffic but creates trust warnings and is inconvenient for examiners.
- An owned domain with a standard certificate/renewal workflow is the conventional public option. Domain/address purchases, firewall changes and any paid resource allocation require an explicit plan first.

Do not send passwords over plain public HTTP or expose an unauthenticated endpoint accidentally. Keep inputs synthetic. Actual public access/HTTPS, hosted predictions, VM fit and rollback execution remain unverified until authorized deployment is performed.
