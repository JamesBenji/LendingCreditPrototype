## Existing architecture

The product has a React static build, Flask behind Gunicorn, Nginx serving assets and proxying API requests, and a systemd service. The repository service specifies one synchronous worker and thread limits; every worker loads its own artifacts. The Nginx template is loopback-only, while the live domain/TLS configuration is owner-operated. {{source:wsgi|WSGI entry}} {{source:systemd|Service unit}} {{source:nginx|Proxy template}}

## Release boundary

Packaging explicitly includes the backend, built frontend, artifacts, selected deployment and verification files. It does not include this static research site. Builds and training do not belong on the constrained VM. Tar-only updates contain the installer; they do not need a server Git checkout. {{source:package|Release packager}} {{source:deployment|Update procedure}}

A public HTTPS response showed the original frontend while a newer candidate was prepared. Reachability therefore did not establish that the intended release was active. {{evidence:vm}}

## Memory failure and recovery

The deployment record reports dependency installation and pip check success, then less than 350 MB available before model preflight. The candidate never activated and the prior release remained selected. Exact available memory is not supplied. {{source:deployment-log|Mobile update attempt}}

Recovery instructions temporarily stop the old service, validate the prepared candidate, activate it, check HTTPS before/after restart and attempt restoration on failure. Nginx/TLS settings are preserved. Recovery success, hosted prediction parity, renewal, VM resources and a full reboot remain unconfirmed. {{source:deployment|Memory recovery and rollback}} {{evidence:vm}}

## Pages is a separate system

This publication builds only its own Astro project and deploys static output through official Pages actions. It neither deploys nor restarts the product. No browser request from this site reaches the prediction API. {{source:package|Explicit release inputs}}

## Update memory and steady-state memory are different

The deployment procedure checks memory headroom before candidate validation while the earlier release can still be running. A small steady-state process measurement does not establish that this transition fits on the VM. The memory gate stopped before model preflight, so the record proves insufficient measured headroom at that stage, not a precise diagnosis of which process consumed it. Resource measurements and verified activation are needed before claiming a recovery succeeded. {{source:deployment|Preflight memory gate and recovery}} {{evidence:vm}}
