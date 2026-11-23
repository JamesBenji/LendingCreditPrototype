# Deployment record — 23 November 2026

James Benjamin operates deployment through the GCP browser terminal. The assistant prepared the release and supplied commands without VM access. This record separates observed output from selected setup and checks awaiting recorded results.

For subsequent updates, the owner can upload only the tar archive and has no GitHub checkout on the server. The archive contains the current installer, built frontend, backend, artifacts and verification files. The VM extracts and runs that bundled installer; no separate installer upload or GitHub download is required.

## Initial release

| Item | Recorded value |
|---|---|
| Repository | https://github.com/JamesBenji/LendingCreditPrototype |
| Inspected thesis/application commit | d8643c8e1f3aa3c34ba95279291706a7ac96d5eb |
| Initial deployment source commit | 6527f59086ab6b7943ca8085982ec3ec0f84efea |
| Archive | eab-credit-6527f59086ab.tar.gz |
| Archive size | 1,405,214 bytes |
| Archive SHA-256 | 8285d330ed14d93cfa093e93450bbb6cf140be00176aac084542dd5856923fb2 |
| Confirmed upload location | /home/jamesbenjamin450/eab-credit-6527f59086ab.tar.gz |
| Instance | instance-20260709-161649 |
| External / internal IP | 34.72.123.66 / 10.128.0.2 |
| Selected public URL | https://eab-credit.preview.james-benjamin.com |

Model identities remain in [runtime evidence](evidence/runtime-inspection.json) and the release manifest. The later installer update preserves nginx settings and does not modify prediction code or saved models.

## Setup sequence and evidence

| Step | Evidence/status |
|---|---|
| Local release build and integrity | Verified locally; extracted code matched all three synthetic fixtures |
| SCP transfer | Owner confirmed; VM listing showed the exact archive name and size in the home directory |
| Initial release activation | Owner's later readlink output confirmed the initial release remained active |
| Installed nginx site | Owner pasted the static-root/Flask-proxy server block, initially on 127.0.0.1:8080 |
| Domain and external IP | Owner supplied hostname and addresses; DNS must use the external address |
| DNS A record and ingress TCP 80/443 | Instructions supplied; DNS/firewall confirmation not provided |
| Public nginx listener/server name | Exact edits supplied; resulting file/test output not provided |
| HTTPS and renewal | Public HTTPS retrieval succeeded during investigation; Certbot issuance/expiry/renewal reports not provided |
| Hosted predictions, invalid request, restart and VM resources | Checks built into installer; results not supplied |

Unverified here does not imply a step failed or was not completed by the owner. It means supporting output has not been received. Setup occurred during 23–24 November 2026; the initial upload listing was dated 23 November.

## Mobile update attempt and memory failure — 24 November 2026

| Item | Observed value/result |
|---|---|
| Candidate source commit | 88d83bc006e694a34b61f02f8e22cba33574e814 |
| Uploaded candidate archive | /home/jamesbenjamin450/eab-credit-88d83bc006e6.tar.gz |
| Candidate archive SHA-256 | ce96cd7fd12973e5570cb5a954917d19215f2bee2aa953d73f0323224b7e27ff |
| Prepared release / Python environment | /opt/eab-credit/releases/88d83bc006e6-ce96cd7f / .venv |
| Dependency installation | Installer output showed successful pinned package installation, including xgboost-cpu 2.1.4 |
| Dependency consistency | pip check: No broken requirements found |
| Failure point | Less than 350 MB available before model preflight |
| Exact free/available memory | Not supplied; only the threshold failure is known |
| Active release afterward | /opt/eab-credit/releases/6527f59086ab-8285d330 |
| Original failure log | /opt/eab-credit/verification/88d83bc006e6-ce96cd7f/install.log |
| Public frontend observed | index-B8q2tcIv.js and index-Desia_8l.css, matching the initial archive |
| Expected mobile frontend | index-5yrD9taV.js and index-BwULefNR.css in the candidate archive |

The old app had not been stopped for preflight. The new release never reached activation, so the reported mobile tooltip problem was explained by the original frontend still being served. A fresh public request also returned the old assets; clearing the phone's cache would not activate the prepared release.

Recovery commands were supplied to stop the old service briefly, validate the candidate using its existing environment, run tests, switch the current symlink and check HTTPS before/after restart. The commands preserve nginx/Certbot settings and attempt to restart the preceding release on failure. **Execution and outcome are not yet confirmed.** No additional tar upload is needed for this incident.

See [memory recovery instructions](DEPLOYMENT.md#recover-an-update-stopped-by-the-memory-check). Successful recovery produces recovery.log, recovery-preflight.json, recovery-http.json, recovery-http-after-restart.json and memory reports in the candidate verification directory. Append the actual results here when available.

## Add an entry after setup / each update

Keep reports under /opt/eab-credit/verification/RELEASE_ID/ and append:

- Date/time and operator.
- Source commit, archive SHA-256 and installed release path.
- Model/calibrator/metadata hashes from the manifest.
- Public URL, DNS resolution and certificate expiry/renewal result.
- Prediction parity and invalid-request result through HTTPS.
- Service restart result; distinguish it from a VM reboot.
- Service memory peak, VM available memory and disk usage.
- Previous release, backup path and rollback outcome if used.

The [deployment guide](DEPLOYMENT.md#update-the-codebase-tomorrow) contains update commands that preserve the domain and Certbot configuration.
