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
| Download matching installer and run sudo installation | Commands supplied; completion logs not provided |
| Installed nginx site | Owner pasted the static-root/Flask-proxy server block, initially on 127.0.0.1:8080 |
| Domain and external IP | Owner supplied hostname and addresses; DNS must use the external address |
| DNS A record and ingress TCP 80/443 | Instructions supplied; DNS/firewall confirmation not provided |
| Public nginx listener/server name | Exact edits supplied; resulting file/test output not provided |
| HTTPS and renewal | Certbot commands supplied; certificate/renewal output not provided |
| Hosted predictions, invalid request, restart and VM resources | Checks built into installer; results not supplied |

Unverified here does not imply a step failed or was not completed by the owner. It means supporting output has not been received. Setup occurred during 23–24 November 2026; the initial upload listing was dated 23 November.

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
